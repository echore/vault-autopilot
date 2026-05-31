# Clip Multi-Mode Design Spec
Date: 2026-05-30

## Goal

Extend the vault-autopilot HTTP `/clip` endpoint to support three capture modes sent by the Obsidian Visual Clipper Chrome extension: `screenshot`, `hook`, and `keyframe`. Each mode has a distinct payload shape and processing path. The existing vault watcher (file-drop → AI analysis) must remain completely unaffected.

**Out of scope**: Chrome extension itself, CLI provider multi-frame support, Task 10–11 work.

**Done when**: All five success criteria in §6 pass.

---

## 1. Payload Types

`server.ts` replaces the old flat `ClipPayload` with a discriminated union. All four shapes are valid inputs:

```typescript
// Legacy format — backward compat
type LegacyClipPayload = {
  image_base64: string;
  source_url: string;
  title: string;
};

type ScreenshotPayload = {
  mode: 'screenshot';
  image: string;         // base64
  url: string;
  title: string;
};

type HookPayload = {
  mode: 'hook';
  frames: string[];      // base64 array
  transcript?: string;
  video_title: string;
  channel?: string;
  platform?: string;
  url: string;
  captured_at: string;
};

type KeyframePayload = {
  mode: 'keyframe';
  frames: string[];      // base64 array
  video_title: string;
  url: string;
  time_range: { start: number; end: number };
  captured_at: string;
};

type ClipPayload = ScreenshotPayload | HookPayload | KeyframePayload | LegacyClipPayload;
```

Detection order in `clip-router.ts`:
1. Has `image_base64` field → treat as legacy screenshot
2. Has `mode: 'screenshot'` → new screenshot
3. Has `mode: 'hook'` → hook
4. Has `mode: 'keyframe'` → keyframe
5. Else → throw error (server returns 400)

---

## 2. Provider Layer Extension

### 2a. New types in `src/types.ts`

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

### 2b. Which providers implement `MultiFrameProvider`

| Provider | Supports multi-frame | Reason |
|----------|----------------------|--------|
| `anthropic.ts` | ✅ | Multiple `image` content blocks in one message |
| `openai-compat.ts` | ✅ | Multiple image_url entries in one message |
| `gemini-api.ts` | ✅ | Multiple inline image parts |
| `cli-base.ts` | ❌ | stdin/stdout cannot carry multiple binary images efficiently |

CLI providers selected for `hook`/`keyframe` clip rules will receive a clear error at route time:
`"Provider 'X' does not support multi-frame analysis. Use an API provider (Anthropic, OpenAI-compatible, or Gemini)."`

### 2c. Multi-frame API construction

Each API provider sends all frames as separate image content blocks in a single API call, followed by the text context block. The SOP is sent as the system prompt (same pattern as single-image analysis today).

**Anthropic** (`messages.create`):
```
system: sopContent
user: [
  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: frame[0] } },
  { type: 'image', source: { type: 'base64', media_type: 'image/png', data: frame[1] } },
  ...
  { type: 'text', text: buildMultiFrameContext(req) }
]
```

**OpenAI-compat** (`chat.completions.create`):
```
system: sopContent
user: [
  { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
  { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
  ...
  { type: 'text', text: buildMultiFrameContext(req) }
]
```

**Gemini** (`generateContent`):
```
[
  { inlineData: { mimeType: 'image/png', data: frame[0] } },
  { inlineData: { mimeType: 'image/png', data: frame[1] } },
  ...
  { text: sopContent + '\n\n' + buildMultiFrameContext(req) }
]
```

`buildMultiFrameContext(req)` produces a text block with `video_title`, `channel`, `platform`, `url`, `time_range`, `transcript` (if present), formatted as key-value lines.

---

## 3. Settings Extension

### 3a. `ClipRule` — only for hook and keyframe

Screenshot mode uses the existing first enabled `WatchRule` (same behavior as today — `main.ts::startServer()` already does this). No separate clip rule for screenshot: the user has already configured a WatchRule with the right watchFolder, SOP, output, and provider.

Hook and keyframe modes bypass the vault watcher entirely (direct AI call), so they need their own configuration:

```typescript
// src/types.ts
export interface ClipRule {
  sopPath: string;       // absolute path to SOP markdown file
  outputFolder: string;  // vault-relative path for the output note
  providerId: string;    // must match a ProviderConfig.id; must be a MultiFrameProvider
}

// Extended PluginSettings
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

**Why object, not array**: Hook and keyframe modes are fixed by the Chrome extension's payload format — users cannot invent new modes. A fixed-key object gives TypeScript exhaustiveness checking and prevents duplicate/missing mode configs. An array is appropriate only for user-defined extensible rules (like the existing `WatchRule[]`).

### 3b. Default values in `src/settings.ts`

```typescript
const DEFAULT_CLIP_RULE: ClipRule = { sopPath: '', outputFolder: '', providerId: '' };

export const DEFAULT_SETTINGS: PluginSettings = {
  rules: [],
  providers: [],
  httpServer: { enabled: true, port: 27183 },
  clipRules: {
    hook: { ...DEFAULT_CLIP_RULE },
    keyframe: { ...DEFAULT_CLIP_RULE },
  },
};
```

`loadSettings()` in `main.ts` must deep-merge `clipRules` (same pattern used for `httpServer` today):
```typescript
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
```

### 3c. Settings UI in `src/settings.ts`

A new `── Clip Rules ──` section renders after `Watch Rules`. Two fixed sub-sections (screenshot uses the existing Watch Rules section):

```
── Clip Rules ──────────────────────────────────────────────
  Note: Screenshot clips use the first enabled Watch Rule above.

  Hook Analysis
    SOP path        [text input — absolute path]
    Output folder   [text input — vault-relative]
    Provider        [dropdown — API providers only]

  Keyframe Analysis
    SOP path        [text input — absolute path]
    Output folder   [text input — vault-relative]
    Provider        [dropdown — API providers only]
```

No Add/Remove buttons — modes are fixed. Dropdowns are populated from `this.plugin.settings.providers`.

---

## 4. Routing Layer — `src/clip-router.ts` (new file)

Single exported function called from `main.ts::startServer()`:

```typescript
export async function routeClip(
  payload: ClipPayload,
  providers: Map<string, AIProvider>,
  clipRules: PluginSettings['clipRules'],
  watchRules: WatchRule[],
  vaultOps: VaultOps,
): Promise<void>
```

`VaultOps` is a plain interface (not a class) passed in from `main.ts`, containing only the vault operations clip-router needs. This keeps `clip-router.ts` free of Obsidian API imports and independently testable:

```typescript
interface VaultOps {
  ensureFolder(path: string): Promise<void>;
  createBinary(path: string, data: ArrayBuffer): Promise<void>;
  create(path: string, content: string): Promise<void>;
  readFileSync(absolutePath: string): string;
}
```

### Routing logic

**screenshot / legacy**
1. Find first enabled WatchRule; throw if none
2. Write `.meta.json` with `{ source_url, title }` to `rule.watchFolder`
3. Decode image base64 → write `.png` to `rule.watchFolder`
4. Return — vault watcher picks up the file and runs existing processFile flow

**hook**
1. Resolve `clipRules.hook`; throw if `sopPath`/`outputFolder`/`providerId` not configured
2. Get provider from map; call `isMultiFrameProvider` — throw clear error if false
3. Decode `frames[]` from base64 to `Buffer[]`
4. Validate `frames.length ≤ 20` — throw if exceeded (prevents memory exhaustion)
5. Read `sopContent` from `clipRules.hook.sopPath`
6. Call `provider.analyzeMultiFrame({ frames, transcript, sopContent, meta })`
7. Apply `postProcessMarkdown(result)`
8. Write note to `clipRules.hook.outputFolder/hook-{sanitize(video_title)}-{timestamp}.md`

**keyframe**
1. Resolve `clipRules.keyframe`; throw if not configured
2. Get provider; `isMultiFrameProvider` check
3. Decode `frames[]`, validate `≤ 20`
4. Read `sopContent`
5. Call `provider.analyzeMultiFrame({ frames, sopContent, meta })`
6. Apply `postProcessMarkdown(result)`
7. Write note to `clipRules.keyframe.outputFolder/keyframe-{sanitize(video_title)}-{timestamp}.md`

`postProcessMarkdown` and `sanitize` are moved from `main.ts` to a new `src/util.ts` and imported by both `main.ts` and `clip-router.ts`. No duplication, no circular imports.

---

## 5. Changes to Existing Files

| File | Change |
|------|--------|
| `src/types.ts` | Add `MultiFrameRequest`, `MultiFrameProvider`, `isMultiFrameProvider`, `ClipRule`; extend `PluginSettings` |
| `src/server.ts` | Replace `ClipPayload` with discriminated union; `ClipHandler` signature unchanged |
| `src/main.ts` | `startServer()` calls `routeClip`; deep-merge `clipRules` in `loadSettings()`; move `postProcessMarkdown`+`sanitize` to `src/util.ts` |
| `src/settings.ts` | Add `clipRules` defaults and Hook/Keyframe UI section |
| `src/providers/anthropic.ts` | Implement `analyzeMultiFrame()` |
| `src/providers/openai-compat.ts` | Implement `analyzeMultiFrame()` |
| `src/providers/gemini-api.ts` | Implement `analyzeMultiFrame()` |
| `src/util.ts` | **New file** — `postProcessMarkdown`, `sanitize` |
| `src/clip-router.ts` | **New file** — all clip dispatch logic |

Files **not touched**: `src/providers/cli-base.ts`, `src/processor.ts`, `src/path-detector.ts`, `src/startup-check.ts`.

---

## 6. Success Criteria

1. `POST { mode: "screenshot", image: "...", url: "...", title: "..." }` → image saved to first WatchRule's watchFolder → vault watcher produces note ✅
2. `POST { mode: "hook", frames: [...], video_title: "...", ... }` → Hook analysis note appears in hook outputFolder ✅
3. `POST { mode: "keyframe", frames: [...], time_range: {...}, ... }` → Keyframe note appears in keyframe outputFolder ✅
4. `POST { image_base64: "...", source_url: "...", title: "..." }` (legacy) → same behavior as criterion 1 ✅
5. Dropping a file into a watched folder triggers analysis as before — vault watcher untouched ✅

---

## 7. Testing Strategy

TDD order: util → server payload parsing → clip-router routing → provider multi-frame → settings (no unit tests per CLAUDE.md).

| Test file | What it covers |
|-----------|---------------|
| `tests/util.test.ts` | `postProcessMarkdown`, `sanitize` |
| `tests/server.test.ts` | Payload parsing: valid modes, legacy format, unknown mode → error |
| `tests/clip-router.test.ts` | Routing per mode; non-MultiFrameProvider error; frames > 20 error; missing rule config error |
| `tests/providers/anthropic.test.ts` | `analyzeMultiFrame` builds correct multi-image message |
| `tests/providers/openai-compat.test.ts` | Same |
| `tests/providers/gemini-api.test.ts` | Same |

All existing tests must continue to pass without modification.
