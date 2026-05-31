# Clip Multi-Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `/clip` HTTP endpoint to handle three capture modes (`screenshot`, `hook`, `keyframe`) from the Obsidian Visual Clipper Chrome extension, with backward compatibility for the legacy payload format.

**Architecture:** New `src/util.ts` extracts shared helpers; new `src/clip-router.ts` owns all dispatch logic (screenshot → vault watcher, hook/keyframe → direct multi-frame AI call); three API providers gain `analyzeMultiFrame()` via a new `MultiFrameProvider` interface; `PluginSettings` grows a `clipRules` object for hook/keyframe configuration.

**Tech Stack:** TypeScript, Jest/ts-jest, `@anthropic-ai/sdk`, `openai`, `@google/generative-ai`, Obsidian Plugin API

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/util.ts` | **Create** | `postProcessMarkdown`, `sanitize` |
| `src/types.ts` | **Modify** | Add `MultiFrameRequest`, `MultiFrameProvider`, `isMultiFrameProvider`, `ClipRule`; extend `PluginSettings` |
| `src/server.ts` | **Modify** | Replace `ClipPayload` with discriminated union |
| `src/clip-router.ts` | **Create** | All clip dispatch logic + `VaultOps` interface |
| `src/providers/anthropic.ts` | **Modify** | Add `analyzeMultiFrame()` |
| `src/providers/openai-compat.ts` | **Modify** | Add `analyzeMultiFrame()` |
| `src/providers/gemini-api.ts` | **Modify** | Add `analyzeMultiFrame()` |
| `src/settings.ts` | **Modify** | Add `clipRules` defaults + Hook/Keyframe UI section |
| `src/main.ts` | **Modify** | Wire `routeClip`, deep-merge `clipRules`, import `fs` |
| `tests/util.test.ts` | **Create** | Tests for `postProcessMarkdown`, `sanitize` |
| `tests/server.test.ts` | **Modify** | Add tests for new payload shapes |
| `tests/clip-router.test.ts` | **Create** | Tests for routing logic |
| `tests/providers/anthropic.test.ts` | **Modify** | Add `analyzeMultiFrame` tests |
| `tests/providers/openai-compat.test.ts` | **Modify** | Add `analyzeMultiFrame` tests |
| `tests/providers/gemini-api.test.ts` | **Modify** | Add `analyzeMultiFrame` tests |

---

## Task 0: Extract shared utilities into `src/util.ts`

**Files:**
- Create: `src/util.ts`
- Create: `tests/util.test.ts`
- Modify: `src/main.ts` (remove functions, import from util)

- [ ] **Step 1: Write failing tests**

Create `tests/util.test.ts`:

```typescript
import { postProcessMarkdown, sanitize } from '../src/util';

describe('postProcessMarkdown', () => {
  test('wraps bare 6-digit hex codes in backticks', () => {
    expect(postProcessMarkdown('color is #ff0000 here')).toBe('color is `#ff0000` here');
  });
  test('wraps bare 3-digit hex codes in backticks', () => {
    expect(postProcessMarkdown('color #fff')).toBe('color `#fff`');
  });
  test('does not double-wrap already backtick-wrapped codes', () => {
    expect(postProcessMarkdown('color is `#ff0000` here')).toBe('color is `#ff0000` here');
  });
  test('does not wrap non-hex hash tags', () => {
    expect(postProcessMarkdown('see #tag here')).toBe('see #tag here');
  });
});

describe('sanitize', () => {
  test('removes forbidden filename characters', () => {
    expect(sanitize('file/name:bad*char')).toBe('file name bad char');
  });
  test('collapses multiple spaces into one', () => {
    expect(sanitize('a   b')).toBe('a b');
  });
  test('trims to 60 characters', () => {
    expect(sanitize('a'.repeat(70))).toHaveLength(60);
  });
  test('returns empty string for empty input', () => {
    expect(sanitize('')).toBe('');
  });
  test('returns empty string for undefined input', () => {
    expect(sanitize(undefined as any)).toBe('');
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx jest tests/util.test.ts --no-coverage
```

Expected: `Cannot find module '../src/util'`

- [ ] **Step 3: Create `src/util.ts`**

```typescript
export function postProcessMarkdown(md: string): string {
  return md.replace(/(?<!`)(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?!`)/g, '`$1`');
}

export function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx jest tests/util.test.ts --no-coverage
```

Expected: `5 passed, 0 failed`

- [ ] **Step 5: Remove functions from `src/main.ts`, import from util**

In `src/main.ts`:
- Remove the two functions at the bottom of the file:
  ```typescript
  function postProcessMarkdown(md: string): string { ... }
  function sanitize(str: string): string { ... }
  ```
- Add import at the top (after existing imports):
  ```typescript
  import { postProcessMarkdown, sanitize } from './util';
  ```

- [ ] **Step 6: Confirm full test suite still passes**

```bash
npm test
```

Expected: all existing tests pass, `util.test.ts` 5 passed.

- [ ] **Step 7: Commit**

```bash
git add src/util.ts tests/util.test.ts src/main.ts
git commit -m "refactor: extract postProcessMarkdown and sanitize into src/util.ts"
```

---

## Task 1: Extend `src/types.ts` with multi-frame types

**Files:**
- Modify: `src/types.ts`

No unit tests — pure type definitions plus one trivial type guard (tested in Task 3).

- [ ] **Step 1: Add new types to `src/types.ts`**

After the existing `AIProvider` interface, add:

```typescript
export interface MultiFrameRequest {
  frames: Buffer[];
  transcript?: string;
  sopContent: string;
  meta: {
    video_title?: string;
    channel?: string;
    platform?: string;
    url?: string;
    time_range?: { start: number; end: number };
    captured_at?: string;
  };
}

export interface MultiFrameProvider extends AIProvider {
  analyzeMultiFrame(req: MultiFrameRequest): Promise<string>;
}

export function isMultiFrameProvider(p: AIProvider): p is MultiFrameProvider {
  return typeof (p as any).analyzeMultiFrame === 'function';
}
```

After the `WatchRule` interface, add:

```typescript
export interface ClipRule {
  sopPath: string;       // absolute path to SOP markdown file
  outputFolder: string;  // vault-relative path
  providerId: string;    // must match a ProviderConfig.id
}
```

Replace the `PluginSettings` interface with:

```typescript
export interface PluginSettings {
  rules: WatchRule[];
  providers: ProviderConfig[];
  httpServer: HttpServerSettings;
  clipRules: {
    hook: ClipRule;
    keyframe: ClipRule;
  };
}
```

- [ ] **Step 2: Confirm TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add MultiFrameRequest, MultiFrameProvider, ClipRule types"
```

---

## Task 2: Update `src/server.ts` payload type to discriminated union

**Files:**
- Modify: `src/server.ts`
- Modify: `tests/server.test.ts`

- [ ] **Step 1: Add new payload type tests to `tests/server.test.ts`**

Append inside the existing `describe('createServer', ...)` block, after the last existing test:

```typescript
  test('POST /clip with new screenshot payload calls handler', async () => {
    const payload = { mode: 'screenshot', image: 'abc', url: 'https://x.com', title: 'Test' };
    const { status, body } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip with hook payload calls handler', async () => {
    const payload = {
      mode: 'hook',
      frames: ['ZnJhbWUx', 'ZnJhbWUy'],
      video_title: 'My Hook',
      url: 'https://yt.com',
      captured_at: '2026-05-30T18:00:00Z',
    };
    const { status } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip with keyframe payload calls handler', async () => {
    const payload = {
      mode: 'keyframe',
      frames: ['ZnJhbWUx'],
      video_title: 'My Video',
      url: 'https://yt.com',
      time_range: { start: 0, end: 15 },
      captured_at: '2026-05-30T18:00:00Z',
    };
    const { status } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(handler).toHaveBeenCalledWith(payload);
  });
```

- [ ] **Step 2: Run tests — confirm new tests fail (TS compile error or type mismatch)**

```bash
npx jest tests/server.test.ts --no-coverage
```

The new tests will pass at runtime (server doesn't validate payload shape) but this step confirms existing tests still pass before we touch server.ts.

- [ ] **Step 3: Replace `ClipPayload` in `src/server.ts`**

Replace the entire top of `src/server.ts` (lines 1–9 — the interface and type):

```typescript
import * as http from 'http';

export type LegacyClipPayload = {
  image_base64: string;
  source_url: string;
  title: string;
};

export type ScreenshotPayload = {
  mode: 'screenshot';
  image: string;
  url: string;
  title: string;
};

export type HookPayload = {
  mode: 'hook';
  frames: string[];
  transcript?: string;
  video_title: string;
  channel?: string;
  platform?: string;
  url: string;
  captured_at: string;
};

export type KeyframePayload = {
  mode: 'keyframe';
  frames: string[];
  video_title: string;
  url: string;
  time_range: { start: number; end: number };
  captured_at: string;
};

export type ClipPayload =
  | ScreenshotPayload
  | HookPayload
  | KeyframePayload
  | LegacyClipPayload;

export type ClipHandler = (payload: ClipPayload) => Promise<void>;
```

The `createServer` function body is unchanged — it still just parses JSON as `ClipPayload` and calls `onClip`.

- [ ] **Step 4: Confirm TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. The existing server test line `const payload: ClipPayload = { image_base64: 'abc', ... }` still compiles because `LegacyClipPayload` is a union member.

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/server.ts tests/server.test.ts
git commit -m "feat: replace ClipPayload with discriminated union supporting all three clip modes"
```

---

## Task 3: Create `src/clip-router.ts`

**Files:**
- Create: `src/clip-router.ts`
- Create: `tests/clip-router.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/clip-router.test.ts`:

```typescript
import { routeClip, VaultOps } from '../src/clip-router';
import { AIProvider, ClipRule, WatchRule, isMultiFrameProvider } from '../src/types';
import { ClipPayload } from '../src/server';

function makeMultiFrameProvider(id = 'p1') {
  return {
    id,
    name: 'Mock API Provider',
    analyze: jest.fn(),
    analyzeMultiFrame: jest.fn().mockResolvedValue('# Analysis\nContent'),
  };
}

function makeSingleProvider(id = 'p2') {
  return { id, name: 'Mock CLI', analyze: jest.fn() };
}

function makeVaultOps(): jest.Mocked<VaultOps> {
  return {
    ensureFolder: jest.fn().mockResolvedValue(undefined),
    createBinary: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    readFileSync: jest.fn().mockReturnValue('# SOP\nAnalyze this.'),
  };
}

const enabledWatchRule: WatchRule = {
  id: 'r1', enabled: true,
  watchFolder: 'Inbox', sopPath: '/sop.md',
  outputFolder: 'Notes', providerId: 'p1',
};

const hookClipRule: ClipRule = { sopPath: '/hook-sop.md', outputFolder: 'Hooks', providerId: 'p1' };
const keyframeClipRule: ClipRule = { sopPath: '/kf-sop.md', outputFolder: 'Keyframes', providerId: 'p1' };
const clipRules = { hook: hookClipRule, keyframe: keyframeClipRule };

// ── isMultiFrameProvider ──────────────────────────────────────────────────────

describe('isMultiFrameProvider', () => {
  test('returns true when analyzeMultiFrame method is present', () => {
    expect(isMultiFrameProvider(makeMultiFrameProvider())).toBe(true);
  });
  test('returns false when analyzeMultiFrame is absent', () => {
    expect(isMultiFrameProvider(makeSingleProvider())).toBe(false);
  });
});

// ── legacy format ─────────────────────────────────────────────────────────────

describe('routeClip — legacy format', () => {
  test('saves image and meta.json to first enabled watchRule folder', async () => {
    const vaultOps = makeVaultOps();
    const payload = { image_base64: Buffer.from('frame').toString('base64'), source_url: 'https://x.com', title: 'Test' };
    await routeClip(payload as ClipPayload, new Map(), clipRules, [enabledWatchRule], vaultOps);
    expect(vaultOps.ensureFolder).toHaveBeenCalledWith('Inbox');
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Inbox/'),
      expect.any(ArrayBuffer),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('.meta.json'),
      expect.stringContaining('"source_url":"https://x.com"'),
    );
  });

  test('throws when no enabled watch rules exist', async () => {
    const vaultOps = makeVaultOps();
    const payload = { image_base64: 'AAAA', source_url: '', title: '' };
    await expect(routeClip(payload as ClipPayload, new Map(), clipRules, [], vaultOps))
      .rejects.toThrow('No enabled watch rules');
  });
});

// ── screenshot ────────────────────────────────────────────────────────────────

describe('routeClip — screenshot', () => {
  test('saves new-format screenshot image and meta to watchRule folder', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'screenshot',
      image: Buffer.from('pixels').toString('base64'),
      url: 'https://x.com',
      title: 'My Screenshot',
    };
    await routeClip(payload, new Map(), clipRules, [enabledWatchRule], vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Inbox/'),
      expect.any(ArrayBuffer),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('.meta.json'),
      expect.stringContaining('"title":"My Screenshot"'),
    );
  });
});

// ── hook ──────────────────────────────────────────────────────────────────────

describe('routeClip — hook', () => {
  test('calls analyzeMultiFrame with decoded frames and transcript', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('frame1').toString('base64'), Buffer.from('frame2').toString('base64')],
      transcript: 'Hello world',
      video_title: 'My Hook',
      url: 'https://yt.com',
      captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, providers, clipRules, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      frames: [Buffer.from('frame1'), Buffer.from('frame2')],
      transcript: 'Hello world',
      sopContent: '# SOP\nAnalyze this.',
    }));
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Hooks\/hook-.+\.md/),
      expect.any(String),
    );
  });

  test('throws when hook clip rule has no sopPath configured', async () => {
    const vaultOps = makeVaultOps();
    const emptyRules = { hook: { sopPath: '', outputFolder: 'Hooks', providerId: 'p1' }, keyframe: keyframeClipRule };
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, new Map(), emptyRules, [], vaultOps))
      .rejects.toThrow('not configured');
  });

  test('throws when provider does not support multi-frame', async () => {
    const singleProvider = makeSingleProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', singleProvider]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, providers, clipRules, [], vaultOps))
      .rejects.toThrow('does not support multi-frame');
  });

  test('throws when frames array exceeds 20', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const frames = Array(21).fill(Buffer.from('f').toString('base64'));
    const payload: ClipPayload = {
      mode: 'hook', frames, video_title: 'V',
      url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, providers, clipRules, [], vaultOps))
      .rejects.toThrow('Too many frames');
  });
});

// ── keyframe ──────────────────────────────────────────────────────────────────

describe('routeClip — keyframe', () => {
  test('calls analyzeMultiFrame without transcript and with time_range in meta', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://yt.com',
      time_range: { start: 0, end: 15 },
      captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, providers, clipRules, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      transcript: undefined,
      meta: expect.objectContaining({ time_range: { start: 0, end: 15 } }),
    }));
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Keyframes\/keyframe-.+\.md/),
      expect.any(String),
    );
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx jest tests/clip-router.test.ts --no-coverage
```

Expected: `Cannot find module '../src/clip-router'`

- [ ] **Step 3: Create `src/clip-router.ts`**

```typescript
import * as fs from 'fs';
import { ClipPayload, HookPayload, KeyframePayload, LegacyClipPayload, ScreenshotPayload } from './server';
import { AIProvider, ClipRule, isMultiFrameProvider, MultiFrameRequest, PluginSettings, WatchRule } from './types';
import { postProcessMarkdown, sanitize } from './util';

export interface VaultOps {
  ensureFolder(folderPath: string): Promise<void>;
  createBinary(filePath: string, data: ArrayBuffer): Promise<void>;
  create(filePath: string, content: string): Promise<void>;
  readFileSync(absolutePath: string): string;
}

export async function routeClip(
  payload: ClipPayload,
  providers: Map<string, AIProvider>,
  clipRules: PluginSettings['clipRules'],
  watchRules: WatchRule[],
  vaultOps: VaultOps,
): Promise<void> {
  if (isLegacy(payload)) {
    return handleScreenshot(
      { mode: 'screenshot', image: payload.image_base64, url: payload.source_url, title: payload.title },
      watchRules,
      vaultOps,
    );
  }
  if (payload.mode === 'screenshot') return handleScreenshot(payload, watchRules, vaultOps);
  if (payload.mode === 'hook') return handleMultiFrame(payload, providers, clipRules.hook, vaultOps);
  if (payload.mode === 'keyframe') return handleMultiFrame(payload, providers, clipRules.keyframe, vaultOps);
  throw new Error('Unknown clip mode');
}

function isLegacy(p: ClipPayload): p is LegacyClipPayload {
  return 'image_base64' in p;
}

async function handleScreenshot(
  payload: ScreenshotPayload,
  watchRules: WatchRule[],
  vaultOps: VaultOps,
): Promise<void> {
  const rule = watchRules.find((r) => r.enabled);
  if (!rule) throw new Error('No enabled watch rules configured');
  const stem = `${Date.now()}-${sanitize(payload.title)}`;
  await vaultOps.ensureFolder(rule.watchFolder);
  await vaultOps.create(
    `${rule.watchFolder}/${stem}.meta.json`,
    JSON.stringify({ source_url: payload.url, title: payload.title }),
  );
  const bytes = Buffer.from(payload.image, 'base64');
  await vaultOps.createBinary(`${rule.watchFolder}/${stem}.png`, bytes.buffer as ArrayBuffer);
}

async function handleMultiFrame(
  payload: HookPayload | KeyframePayload,
  providers: Map<string, AIProvider>,
  rule: ClipRule,
  vaultOps: VaultOps,
): Promise<void> {
  if (!rule.sopPath || !rule.outputFolder || !rule.providerId) {
    throw new Error(`Clip rule for "${payload.mode}" is not configured`);
  }
  const provider = providers.get(rule.providerId);
  if (!provider) throw new Error(`Provider "${rule.providerId}" not found`);
  if (!isMultiFrameProvider(provider)) {
    throw new Error(
      `Provider "${provider.name}" does not support multi-frame analysis. ` +
      `Use an API provider (Anthropic, OpenAI-compatible, or Gemini).`,
    );
  }
  if (payload.frames.length > 20) {
    throw new Error(`Too many frames: ${payload.frames.length} (max 20)`);
  }
  const frames = payload.frames.map((f) => Buffer.from(f, 'base64'));
  const sopContent = vaultOps.readFileSync(rule.sopPath);
  const meta: MultiFrameRequest['meta'] = {
    video_title: payload.video_title,
    url: payload.url,
    captured_at: payload.captured_at,
    ...(payload.mode === 'hook'
      ? { channel: payload.channel, platform: payload.platform }
      : { time_range: payload.time_range }),
  };
  const transcript = payload.mode === 'hook' ? payload.transcript : undefined;
  const result = await provider.analyzeMultiFrame({ frames, transcript, sopContent, meta });
  const markdown = postProcessMarkdown(result);
  const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;
  await vaultOps.ensureFolder(rule.outputFolder);
  await vaultOps.create(`${rule.outputFolder}/${stem}.md`, markdown);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx jest tests/clip-router.test.ts --no-coverage
```

Expected: `12 passed, 0 failed`

- [ ] **Step 5: Run full suite**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/clip-router.ts tests/clip-router.test.ts
git commit -m "feat: add clip-router with screenshot/hook/keyframe dispatch logic"
```

---

## Task 4: Add `analyzeMultiFrame` to `src/providers/anthropic.ts`

**Files:**
- Modify: `src/providers/anthropic.ts`
- Modify: `tests/providers/anthropic.test.ts`

- [ ] **Step 1: Add failing tests to `tests/providers/anthropic.test.ts`**

Append after the existing `describe('createAnthropicProvider', ...)` block:

```typescript
import { MultiFrameRequest } from '../../src/types';

describe('analyzeMultiFrame', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: '# Hook Analysis\nContent' }],
    });
    MockAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } }) as any);
  });

  const multiFrameReq: MultiFrameRequest = {
    frames: [Buffer.from('frame1'), Buffer.from('frame2')],
    transcript: 'Hello world',
    sopContent: 'Analyze the hook.',
    meta: { video_title: 'My Hook', channel: 'TestChan', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z' },
  };

  test('returns text from response', async () => {
    const p = createAnthropicProvider(config);
    const result = await (p as any).analyzeMultiFrame(multiFrameReq);
    expect(result).toBe('# Hook Analysis\nContent');
  });

  test('sends each frame as a separate image content block', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    const imageBlocks = userContent.filter((c: any) => c.type === 'image');
    expect(imageBlocks).toHaveLength(2);
    expect(imageBlocks[0].source.data).toBe(Buffer.from('frame1').toString('base64'));
    expect(imageBlocks[1].source.data).toBe(Buffer.from('frame2').toString('base64'));
  });

  test('includes transcript in context text block', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    const textBlock = userContent.find((c: any) => c.type === 'text');
    expect(textBlock.text).toContain('Hello world');
  });

  test('uses sopContent as system prompt', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    expect(call.system).toBe('Analyze the hook.');
  });

  test('throws when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    const p = createAnthropicProvider(config);
    await expect((p as any).analyzeMultiFrame(multiFrameReq)).rejects.toThrow('no text');
  });
});
```

- [ ] **Step 2: Run tests — confirm new tests fail**

```bash
npx jest tests/providers/anthropic.test.ts --no-coverage
```

Expected: `analyzeMultiFrame is not a function`

- [ ] **Step 3: Add `analyzeMultiFrame` to `src/providers/anthropic.ts`**

Add the import at the top:
```typescript
import { AIProvider, AnalysisRequest, AnthropicProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';
```

Replace the returned object literal (add `analyzeMultiFrame` after `analyze`):

```typescript
  return {
    id: config.id,
    name: `Anthropic (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      // ... existing implementation unchanged ...
    },

    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const imageBlocks: any[] = req.frames.map((frame) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/png', data: frame.toString('base64') },
      }));
      const response = await client.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: req.sopContent,
        messages: [{
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: buildMultiFrameContext(req) }],
        }],
      });
      const textBlock = response.content.find((b: any) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('Anthropic returned no text block');
      return (textBlock as any).text.trim();
    },
  } satisfies AIProvider & MultiFrameProvider;
```

Add the helper function at the bottom of the file:

```typescript
function buildMultiFrameContext(req: MultiFrameRequest): string {
  const parts: string[] = [];
  if (req.meta.video_title) parts.push(`Video: ${req.meta.video_title}`);
  if (req.meta.channel) parts.push(`Channel: ${req.meta.channel}`);
  if (req.meta.platform) parts.push(`Platform: ${req.meta.platform}`);
  if (req.meta.url) parts.push(`URL: ${req.meta.url}`);
  if (req.meta.time_range) parts.push(`Time range: ${req.meta.time_range.start}s–${req.meta.time_range.end}s`);
  if (req.meta.captured_at) parts.push(`Captured: ${req.meta.captured_at}`);
  if (req.transcript) parts.push(`\nTranscript:\n${req.transcript}`);
  return parts.join('\n') || 'Analyze the frames.';
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx jest tests/providers/anthropic.test.ts --no-coverage
```

Expected: `8 passed, 0 failed`

- [ ] **Step 5: Commit**

```bash
git add src/providers/anthropic.ts tests/providers/anthropic.test.ts
git commit -m "feat: add analyzeMultiFrame to Anthropic provider"
```

---

## Task 5: Add `analyzeMultiFrame` to `src/providers/openai-compat.ts`

**Files:**
- Modify: `src/providers/openai-compat.ts`
- Modify: `tests/providers/openai-compat.test.ts`

- [ ] **Step 1: Add failing tests to `tests/providers/openai-compat.test.ts`**

First add this import at the top of the file alongside existing imports:
```typescript
import { MultiFrameRequest } from '../../src/types';
```

Append after the existing `describe` block:

```typescript
describe('analyzeMultiFrame', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: '# Analysis\nContent' } }],
    });
    MockOpenAI.mockImplementation(() => ({
      chat: { completions: { create: mockCreate } },
    }) as any);
  });

  const multiFrameReq: MultiFrameRequest = {
    frames: [Buffer.from('frame1'), Buffer.from('frame2')],
    transcript: 'Hello',
    sopContent: 'Analyze frames.',
    meta: { video_title: 'My Video', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z' },
  };

  test('returns trimmed text from response', async () => {
    const p = createOpenAICompatProvider(config);
    const result = await (p as any).analyzeMultiFrame(multiFrameReq);
    expect(result).toBe('# Analysis\nContent');
  });

  test('sends each frame as a separate image_url content block', async () => {
    const p = createOpenAICompatProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userMsg = call.messages.find((m: any) => m.role === 'user');
    const imageBlocks = userMsg.content.filter((c: any) => c.type === 'image_url');
    expect(imageBlocks).toHaveLength(2);
    expect(imageBlocks[0].image_url.url).toContain('data:image/png;base64,');
    expect(imageBlocks[0].image_url.url).toContain(Buffer.from('frame1').toString('base64'));
  });

  test('includes transcript in context text block', async () => {
    const p = createOpenAICompatProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userMsg = call.messages.find((m: any) => m.role === 'user');
    const textBlock = userMsg.content.find((c: any) => c.type === 'text');
    expect(textBlock.text).toContain('Hello');
  });

  test('uses sopContent as system message', async () => {
    const p = createOpenAICompatProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const sysMsg = call.messages.find((m: any) => m.role === 'system');
    expect(sysMsg.content).toBe('Analyze frames.');
  });

  test('throws when response has no content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const p = createOpenAICompatProvider(config);
    await expect((p as any).analyzeMultiFrame(multiFrameReq)).rejects.toThrow('no content');
  });
});
```

- [ ] **Step 2: Run tests — confirm new tests fail**

```bash
npx jest tests/providers/openai-compat.test.ts --no-coverage
```

Expected: `analyzeMultiFrame is not a function`

- [ ] **Step 3: Add `analyzeMultiFrame` to `src/providers/openai-compat.ts`**

Add to the import line at the top:
```typescript
import { AIProvider, AnalysisRequest, OpenAICompatProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';
```

Add after the `analyze` method in the returned object:

```typescript
    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const imageContent = req.frames.map((frame) => ({
        type: 'image_url' as const,
        image_url: { url: `data:image/png;base64,${frame.toString('base64')}` },
      }));
      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: req.sopContent },
          { role: 'user', content: [...imageContent, { type: 'text' as const, text: buildMultiFrameContext(req) }] },
        ],
        max_tokens: 4096,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('API returned no content');
      return content.trim();
    },
```

Change the return type annotation to `satisfies AIProvider & MultiFrameProvider`.

Add this helper function at the bottom of the file:

```typescript
function buildMultiFrameContext(req: MultiFrameRequest): string {
  const parts: string[] = [];
  if (req.meta.video_title) parts.push(`Video: ${req.meta.video_title}`);
  if (req.meta.channel) parts.push(`Channel: ${req.meta.channel}`);
  if (req.meta.platform) parts.push(`Platform: ${req.meta.platform}`);
  if (req.meta.url) parts.push(`URL: ${req.meta.url}`);
  if (req.meta.time_range) parts.push(`Time range: ${req.meta.time_range.start}s–${req.meta.time_range.end}s`);
  if (req.meta.captured_at) parts.push(`Captured: ${req.meta.captured_at}`);
  if (req.transcript) parts.push(`\nTranscript:\n${req.transcript}`);
  return parts.join('\n') || 'Analyze the frames.';
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx jest tests/providers/openai-compat.test.ts --no-coverage
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/openai-compat.ts tests/providers/openai-compat.test.ts
git commit -m "feat: add analyzeMultiFrame to OpenAI-compatible provider"
```

---

## Task 6: Add `analyzeMultiFrame` to `src/providers/gemini-api.ts`

**Files:**
- Modify: `src/providers/gemini-api.ts`
- Modify: `tests/providers/gemini-api.test.ts`

- [ ] **Step 1: Add failing tests to `tests/providers/gemini-api.test.ts`**

First, check the existing mock pattern in the file. The mock should already be set up as:
```typescript
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(...),
}));
```

Add this import at the top:
```typescript
import { MultiFrameRequest } from '../../src/types';
```

Append after the existing `describe` block:

```typescript
describe('analyzeMultiFrame', () => {
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    mockGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => '# Keyframe Analysis\nContent' },
    });
    (GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({ generateContent: mockGenerateContent }),
    }) as any);
  });

  const multiFrameReq: MultiFrameRequest = {
    frames: [Buffer.from('frame1'), Buffer.from('frame2')],
    sopContent: 'Analyze the keyframes.',
    meta: { video_title: 'My Video', url: 'https://yt.com', time_range: { start: 0, end: 15 }, captured_at: '2026-05-30T18:00:00Z' },
  };

  test('returns trimmed text from response', async () => {
    const p = createGeminiAPIProvider(config);
    const result = await (p as any).analyzeMultiFrame(multiFrameReq);
    expect(result).toBe('# Keyframe Analysis\nContent');
  });

  test('sends each frame as a separate inlineData part', async () => {
    const p = createGeminiAPIProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const parts = mockGenerateContent.mock.calls[0][0];
    const inlineDataParts = parts.filter((p: any) => p.inlineData);
    expect(inlineDataParts).toHaveLength(2);
    expect(inlineDataParts[0].inlineData.mimeType).toBe('image/png');
    expect(inlineDataParts[0].inlineData.data).toBe(Buffer.from('frame1').toString('base64'));
  });

  test('includes sop and context in the text part', async () => {
    const p = createGeminiAPIProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const parts = mockGenerateContent.mock.calls[0][0];
    const textPart = parts.find((p: any) => p.text);
    expect(textPart.text).toContain('Analyze the keyframes.');
    expect(textPart.text).toContain('My Video');
  });
});
```

- [ ] **Step 2: Run tests — confirm new tests fail**

```bash
npx jest tests/providers/gemini-api.test.ts --no-coverage
```

Expected: `analyzeMultiFrame is not a function`

- [ ] **Step 3: Add `analyzeMultiFrame` to `src/providers/gemini-api.ts`**

Update the import:
```typescript
import { AIProvider, AnalysisRequest, GeminiAPIProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';
```

Add after the `analyze` method:

```typescript
    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const model = genAI.getGenerativeModel({ model: config.model });
      const parts: any[] = [
        ...req.frames.map((frame) => ({
          inlineData: { mimeType: 'image/png', data: frame.toString('base64') },
        })),
        { text: req.sopContent + '\n\n' + buildMultiFrameContext(req) },
      ];
      const result = await model.generateContent(parts);
      return result.response.text().trim();
    },
```

Change the return type annotation to `satisfies AIProvider & MultiFrameProvider`.

Add helper function at the bottom:

```typescript
function buildMultiFrameContext(req: MultiFrameRequest): string {
  const parts: string[] = [];
  if (req.meta.video_title) parts.push(`Video: ${req.meta.video_title}`);
  if (req.meta.channel) parts.push(`Channel: ${req.meta.channel}`);
  if (req.meta.platform) parts.push(`Platform: ${req.meta.platform}`);
  if (req.meta.url) parts.push(`URL: ${req.meta.url}`);
  if (req.meta.time_range) parts.push(`Time range: ${req.meta.time_range.start}s–${req.meta.time_range.end}s`);
  if (req.meta.captured_at) parts.push(`Captured: ${req.meta.captured_at}`);
  if (req.transcript) parts.push(`\nTranscript:\n${req.transcript}`);
  return parts.join('\n') || 'Analyze the frames.';
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx jest tests/providers/gemini-api.test.ts --no-coverage
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/providers/gemini-api.ts tests/providers/gemini-api.test.ts
git commit -m "feat: add analyzeMultiFrame to Gemini API provider"
```

---

## Task 7: Wire settings and main — `src/settings.ts` + `src/main.ts`

**Files:**
- Modify: `src/settings.ts`
- Modify: `src/main.ts`

No unit tests for settings UI or main plugin class (per project convention).

- [ ] **Step 1: Update `DEFAULT_SETTINGS` in `src/settings.ts`**

Replace the `DEFAULT_SETTINGS` export:

```typescript
export const DEFAULT_SETTINGS: PluginSettings = {
  rules: [],
  providers: [],
  httpServer: {
    enabled: true,
    port: 27183,
  },
  clipRules: {
    hook: { sopPath: '', outputFolder: '', providerId: '' },
    keyframe: { sopPath: '', outputFolder: '', providerId: '' },
  },
};
```

- [ ] **Step 2: Add Clip Rules UI section to `VaultAutopilotSettingTab.display()` in `src/settings.ts`**

At the end of the `display()` method, after the Watch Rules section, append:

```typescript
    // ── Clip Rules ─────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('Clip Rules').setHeading();
    new Setting(containerEl)
      .setName('Screenshot')
      .setDesc('Uses the first enabled Watch Rule above (watchFolder + provider + SOP).');

    for (const mode of ['hook', 'keyframe'] as const) {
      const label = mode === 'hook' ? 'Hook Analysis' : 'Keyframe Analysis';
      new Setting(containerEl).setName(label).setHeading();
      new Setting(containerEl)
        .setName('SOP / prompt path')
        .setDesc('Absolute path to the markdown SOP file.')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].sopPath)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].sopPath = v.trim();
            await this.plugin.saveSettings();
          }));
      new Setting(containerEl)
        .setName('Output folder')
        .setDesc('Vault-relative path. e.g. Notes/Hooks')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].outputFolder)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].outputFolder = v.trim();
            await this.plugin.saveSettings();
          }));
      new Setting(containerEl)
        .setName('Provider')
        .setDesc('Must be an API provider (Anthropic, OpenAI-compatible, or Gemini).')
        .addDropdown(d => {
          this.plugin.settings.providers.forEach(p =>
            d.addOption(p.id, p.type === 'cli' ? `CLI: ${(p as any).cliType}` : (p as any).label || p.type)
          );
          d.setValue(this.plugin.settings.clipRules[mode].providerId)
            .onChange(async v => {
              this.plugin.settings.clipRules[mode].providerId = v;
              await this.plugin.saveSettings();
            });
        });
    }
```

- [ ] **Step 3: Update `loadSettings()` in `src/main.ts` to deep-merge `clipRules`**

Replace the `loadSettings` method body:

```typescript
  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      httpServer: { ...DEFAULT_SETTINGS.httpServer, ...(loaded?.httpServer ?? {}) },
      clipRules: {
        hook: { ...DEFAULT_SETTINGS.clipRules.hook, ...(loaded?.clipRules?.hook ?? {}) },
        keyframe: { ...DEFAULT_SETTINGS.clipRules.keyframe, ...(loaded?.clipRules?.keyframe ?? {}) },
      },
      rules: loaded?.rules ?? DEFAULT_SETTINGS.rules,
      providers: loaded?.providers ?? DEFAULT_SETTINGS.providers,
    };
  }
```

- [ ] **Step 4: Update `startServer()` in `src/main.ts` to use `routeClip`**

Add to the imports at the top of `main.ts`:
```typescript
import * as fs from 'fs';
import { routeClip, VaultOps } from './clip-router';
```

Replace the `startServer()` method:

```typescript
  private startServer(): void {
    const { port } = this.settings.httpServer;
    const vaultOps: VaultOps = {
      ensureFolder: (p) => this.ensureFolder(p),
      createBinary: (p, data) => this.app.vault.createBinary(p, data),
      create: (p, content) => this.app.vault.create(p, content),
      readFileSync: (p) => fs.readFileSync(p, 'utf8'),
    };
    this.server = createServer(
      port,
      (payload) => routeClip(payload, this.providers, this.settings.clipRules, this.settings.rules, vaultOps),
    );
    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        new Notice(`Vault Autopilot: Port ${port} is already in use. Close the other process or change the port in settings.`, 10000);
      }
    });
  }
```

Also remove the old `handleNewFile` call to `postProcessMarkdown` inside it, and update the existing `handleNewFile` import:

In `handleNewFile`, `postProcessMarkdown` is now imported from `./util` (done in Task 0). Confirm the import is present at the top of `main.ts`:
```typescript
import { postProcessMarkdown, sanitize } from './util';
```

- [ ] **Step 5: Confirm TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Run full test suite**

```bash
npm test
```

Expected: all tests pass, no regressions.

- [ ] **Step 7: Build the plugin**

```bash
npm run build
```

Expected: build succeeds, `main.js` updated.

- [ ] **Step 8: Commit**

```bash
git add src/settings.ts src/main.ts
git commit -m "feat: wire clipRules settings UI and routeClip into main plugin"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|-----------------|------------|
| Discriminated union payload (§1) | Task 2 |
| Legacy backward compat (§1) | Task 3 (`isLegacy`) |
| `MultiFrameProvider` interface + type guard (§2a) | Task 1 + Task 3 tests |
| Anthropic multi-frame (§2c) | Task 4 |
| OpenAI-compat multi-frame (§2c) | Task 5 |
| Gemini multi-frame (§2c) | Task 6 |
| `ClipRule` type + `PluginSettings.clipRules` (§3a) | Task 1 |
| Default values + deep-merge (§3b) | Task 7 |
| Settings UI (§3c) | Task 7 |
| `VaultOps` interface + `routeClip` function (§4) | Task 3 |
| Frames ≤ 20 validation (§4) | Task 3 |
| `postProcessMarkdown` + `sanitize` in util (§4) | Task 0 |
| Files not touched: cli-base, processor, path-detector, startup-check (§5) | ✅ none of these appear in the plan |
| All 5 success criteria (§6) | Tasks 0–7 combined |
| TDD order (§7) | util → server → clip-router → providers → settings/main |

**No gaps found.**
