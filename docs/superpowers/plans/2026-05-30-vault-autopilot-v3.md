# Vault Autopilot — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a general-purpose Obsidian plugin: when a new file appears in a watched folder, read a user-configured SOP/prompt, call any AI provider, write the output as a note. Screenshot Clipper's Chrome extension feeds images into a watched folder via HTTP — the plugin handles the rest.

**Architecture:** Plugin watches N user-defined rules (folder → SOP → output folder). On new file: read file, build analysis request, call configured AI provider, write output note via Obsidian vault API. HTTP server (optional, port 27183, token-authenticated) lets external clients (Chrome extension) drop files into watched folders.

**Tech Stack:** TypeScript, Obsidian Plugin API, Node.js `http`/`child_process`/`fs`/`os`/`crypto`, `openai` SDK (covers OpenRouter/OpenAI/Grok/DeepSeek/Ollama), `@anthropic-ai/sdk`, `@google/generative-ai`, Jest + ts-jest, esbuild

---

## What users configure

| Setting | Notes |
|---------|-------|
| **Rules** (list) | Each rule: watch folder + SOP path + output folder + provider |
| **Providers** (list) | Each provider: type + credentials. Multiple providers can coexist. |
| **HTTP server** | Enable/disable, port (default 27183), auto-generated token |

Everything else (file type detection, temp dir, private API usage) is internal.

**Supported file types (v1):** PNG, JPG, JPEG, WebP, GIF (images) · TXT, MD (plain text)

**Supported providers:**

| Type | Covers | Auth |
|------|--------|------|
| CLI: `claude` | Claude Code subscription | binary path |
| CLI: `gemini` | Google account (free, 1000 req/day) | binary path |
| CLI: `codex` | ChatGPT Plus subscription | binary path |
| OpenAI-compatible | OpenRouter / OpenAI / Grok / DeepSeek / Groq / Ollama | base URL + API key + model |
| Anthropic API | Claude API | API key + model |
| Google Gemini API | Gemini API | API key + model |

---

## File Map

```
obsidian-plugins/vault-autopilot/
  manifest.json
  package.json
  tsconfig.json
  esbuild.config.mjs
  jest.config.js
  src/
    types.ts              shared interfaces: AIProvider, WatchRule, PluginSettings, etc.
    providers/
      cli-base.ts         spawn + stdout parse, shared by all CLI providers
      claude.ts           claude -p args + prompt format
      gemini.ts           gemini args + prompt format
      codex.ts            codex args + prompt format
      openai-compat.ts    openai SDK, configurable baseURL (covers 6 providers)
      anthropic.ts        @anthropic-ai/sdk
      gemini-api.ts       @google/generative-ai
    path-detector.ts      auto-detect CLI binary on Mac/Windows/Linux
    processor.ts          read file → build AnalysisRequest → call provider → return markdown
    server.ts             HTTP server, Bearer token auth
    startup-check.ts      validate all providers + rules on plugin load
    settings.ts           PluginSettings defaults + SettingTab UI
    main.ts               Plugin class: register watchers, start server, wire everything
  tests/
    __mocks__/obsidian.ts
    providers/
      cli-base.test.ts
      openai-compat.test.ts
      anthropic.test.ts
      gemini-api.test.ts
    path-detector.test.ts
    processor.test.ts
    server.test.ts
```

**Modified:** `extension/background.js` (add token header), `extension/popup.html` + `popup.js` (add token field)

---

## Task 0: Scaffold

- [ ] **Step 1: Create manifest.json**

```json
{
  "id": "vault-autopilot",
  "name": "Vault Autopilot",
  "version": "0.1.0",
  "minAppVersion": "1.4.0",
  "description": "Watch folders for new files, run AI analysis via any provider, write structured notes.",
  "author": "liyachen",
  "isDesktopOnly": true
}
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "vault-autopilot",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "tsc --noEmit --skipLibCheck && node esbuild.config.mjs production",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.26.0",
    "@google/generative-ai": "^0.15.0",
    "openai": "^4.52.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "esbuild": "0.21.3",
    "obsidian": "latest",
    "ts-jest": "^29.1.0",
    "typescript": "5.4.5"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "CommonJS",
    "target": "ES2018",
    "allowSyntheticDefaultImports": true,
    "lib": ["ES2018", "DOM"],
    "types": ["node", "jest"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create esbuild.config.mjs**

```js
import esbuild from 'esbuild';
import process from 'process';

const prod = process.argv[2] === 'production';

const ctx = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian', 'electron', 'node:*'],
  format: 'cjs',
  target: 'ES2018',
  logLevel: 'info',
  sourcemap: prod ? false : 'inline',
  treeShaking: true,
  outfile: 'main.js',
});

if (prod) { await ctx.rebuild(); process.exit(0); }
else { await ctx.watch(); }
```

- [ ] **Step 5: Create jest.config.js**

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^obsidian$': '<rootDir>/tests/__mocks__/obsidian.ts' },
};
```

- [ ] **Step 6: Create tests/__mocks__/obsidian.ts**

```typescript
export class Plugin {
  app: any = {};
  loadData = jest.fn().mockResolvedValue({});
  saveData = jest.fn().mockResolvedValue(undefined);
  addSettingTab = jest.fn();
  registerEvent = jest.fn();
}
export class PluginSettingTab {
  containerEl = { empty: jest.fn(), createEl: jest.fn() };
  constructor(public app: any, public plugin: any) {}
}
export class Setting {
  constructor(_el: any) {}
  setName = jest.fn().mockReturnThis();
  setDesc = jest.fn().mockReturnThis();
  setHeading = jest.fn().mockReturnThis();
  addText = jest.fn((cb: any) => { cb({ setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addToggle = jest.fn((cb: any) => { cb({ setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addDropdown = jest.fn((cb: any) => { cb({ addOption: jest.fn().mockReturnThis(), setValue: jest.fn().mockReturnThis(), onChange: jest.fn().mockReturnThis() }); return this; });
  addButton = jest.fn((cb: any) => { cb({ setButtonText: jest.fn().mockReturnThis(), onClick: jest.fn().mockReturnThis() }); return this; });
}
export class Notice { constructor(public message: string, public duration?: number) {} }
export class TFile { path = ''; }
export class TFolder {}
```

- [ ] **Step 7: Install deps**

```bash
cd obsidian-plugins/vault-autopilot && npm install
```

Expected: `node_modules/` created, `openai`, `@anthropic-ai/sdk`, `@google/generative-ai` present.

- [ ] **Step 8: Commit**

```bash
git add obsidian-plugins/vault-autopilot
git commit -m "feat: scaffold vault-autopilot plugin"
```

---

## Task 1: Shared types

**File:** `obsidian-plugins/vault-autopilot/src/types.ts`

No tests needed — pure type definitions.

- [ ] **Step 1: Create src/types.ts**

```typescript
export type FileType = 'image' | 'text';

export interface FileMeta {
  source_url?: string;
  title?: string;
}

export interface AnalysisRequest {
  filePath: string;       // absolute path to the file on disk
  fileType: FileType;
  fileContent: Buffer;    // raw bytes
  sopContent: string;     // contents of the SOP/prompt file
  meta: FileMeta;
}

export interface AIProvider {
  id: string;
  name: string;
  analyze(request: AnalysisRequest): Promise<string>; // returns markdown note content
}

// ── Provider configs ──────────────────────────────────────────────────────────

export interface CLIProviderConfig {
  id: string;
  type: 'cli';
  cliType: 'claude' | 'gemini' | 'codex';
  bin: string;            // resolved absolute path or command name
}

export interface OpenAICompatProviderConfig {
  id: string;
  type: 'openai-compat';
  label: string;          // display name e.g. "OpenRouter", "Grok"
  baseUrl: string;        // e.g. https://openrouter.ai/api/v1
  apiKey: string;
  model: string;          // e.g. gpt-4o, meta-llama/llama-3.2-90b-vision
}

export interface AnthropicProviderConfig {
  id: string;
  type: 'anthropic';
  apiKey: string;
  model: string;          // e.g. claude-sonnet-4-6
}

export interface GeminiAPIProviderConfig {
  id: string;
  type: 'gemini-api';
  apiKey: string;
  model: string;          // e.g. gemini-1.5-flash
}

export type ProviderConfig =
  | CLIProviderConfig
  | OpenAICompatProviderConfig
  | AnthropicProviderConfig
  | GeminiAPIProviderConfig;

// ── Rules ─────────────────────────────────────────────────────────────────────

export interface WatchRule {
  id: string;
  enabled: boolean;
  watchFolder: string;    // vault-relative path
  sopPath: string;        // absolute path to SOP/prompt markdown file
  outputFolder: string;   // vault-relative path
  providerId: string;     // must match a ProviderConfig.id
}

// ── Plugin settings ───────────────────────────────────────────────────────────

export interface HttpServerSettings {
  enabled: boolean;
  port: number;
  token: string;          // auto-generated on first load, never shown in plain text in logs
}

export interface PluginSettings {
  rules: WatchRule[];
  providers: ProviderConfig[];
  httpServer: HttpServerSettings;
}
```

- [ ] **Step 2: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/types.ts
git commit -m "feat: shared types for providers, rules, and settings"
```

---

## Task 2: CLI providers (TDD)

**Files:**
- Create: `src/providers/cli-base.ts`
- Create: `src/providers/claude.ts`
- Create: `tests/providers/cli-base.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/providers/cli-base.test.ts`:

```typescript
import { spawn } from 'child_process';
import { createCLIProvider } from '../../src/providers/cli-base';
import { AnalysisRequest } from '../../src/types';

jest.mock('child_process');
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

function makeMockProc(stdout: string, stderr: string, code: number) {
  const proc: any = {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
  };
  proc.stdout.on.mockImplementation((ev: string, cb: (d: Buffer) => void) => {
    if (ev === 'data') cb(Buffer.from(stdout));
  });
  proc.stderr.on.mockImplementation((ev: string, cb: (d: Buffer) => void) => {
    if (ev === 'data') cb(Buffer.from(stderr));
  });
  proc.on.mockImplementation((ev: string, cb: (code: number) => void) => {
    if (ev === 'close') cb(code);
  });
  mockSpawn.mockReturnValue(proc);
  return proc;
}

const baseRequest: AnalysisRequest = {
  filePath: '/tmp/test.png',
  fileType: 'image',
  fileContent: Buffer.from('fake'),
  sopContent: '# SOP\nAnalyze the image.',
  meta: { source_url: 'https://example.com', title: 'Test' },
};

describe('createCLIProvider (claude)', () => {
  const provider = createCLIProvider({
    id: 'p1', type: 'cli', cliType: 'claude', bin: 'claude',
  });

  test('id and name are set', () => {
    expect(provider.id).toBe('p1');
    expect(provider.name).toContain('claude');
  });

  test('resolves with markdown on success', async () => {
    makeMockProc('some preamble\n```markdown\n# Note\ncontent\n```', '', 0);
    const result = await provider.analyze(baseRequest);
    expect(result).toContain('# Note');
    expect(mockSpawn).toHaveBeenCalledWith(
      'claude',
      expect.arrayContaining(['-p']),
      expect.objectContaining({ timeout: 300_000 }),
    );
  });

  test('resolves with raw stdout when no markdown block', async () => {
    makeMockProc('plain output without code block', '', 0);
    const result = await provider.analyze(baseRequest);
    expect(result).toBe('plain output without code block');
  });

  test('throws on non-zero exit', async () => {
    makeMockProc('', 'auth error', 1);
    await expect(provider.analyze(baseRequest)).rejects.toThrow('auth error');
  });
});

describe('createCLIProvider (gemini)', () => {
  const provider = createCLIProvider({
    id: 'p2', type: 'cli', cliType: 'gemini', bin: 'gemini',
  });

  test('uses -p flag', async () => {
    makeMockProc('gemini output', '', 0);
    await provider.analyze(baseRequest);
    const [bin, args] = mockSpawn.mock.calls[0];
    expect(bin).toBe('gemini');
    expect(args).toContain('-p');
  });
});

describe('createCLIProvider (codex)', () => {
  const provider = createCLIProvider({
    id: 'p3', type: 'cli', cliType: 'codex', bin: 'codex',
  });

  test('uses --prompt flag', async () => {
    makeMockProc('codex output', '', 0);
    await provider.analyze(baseRequest);
    const [bin, args] = mockSpawn.mock.calls[0];
    expect(bin).toBe('codex');
    expect(args).toContain('--prompt');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/cli-base.test.ts
```

Expected: `Cannot find module '../../src/providers/cli-base'`

- [ ] **Step 3: Implement src/providers/cli-base.ts**

```typescript
import { spawn } from 'child_process';
import { AIProvider, AnalysisRequest, CLIProviderConfig } from '../types';

// Each CLI provider has its own non-interactive flag and prompt format.
// NOTE: gemini and codex non-interactive flags verified against their CLIs at time of writing.
// If a future CLI version changes flags, update buildArgs() here.
const CLI_ARGS: Record<string, (prompt: string) => string[]> = {
  claude: (p) => ['-p', p, '--allowedTools', 'Read'],
  gemini: (p) => ['-p', p],
  codex:  (p) => ['--prompt', p, '--quiet'],
};

function buildPrompt(req: AnalysisRequest): string {
  const fileRef = req.fileType === 'image'
    ? `Image file path: ${req.filePath}`
    : `File content:\n\n${req.fileContent.toString('utf8')}`;

  return [
    '--- SOP / INSTRUCTIONS ---',
    req.sopContent,
    '--- FILE TO ANALYZE ---',
    fileRef,
    req.meta.source_url ? `Source URL: ${req.meta.source_url}` : '',
    req.meta.title ? `Title hint: ${req.meta.title}` : '',
    '--- OUTPUT INSTRUCTIONS ---',
    'Output the complete note as a markdown code block (```markdown ... ```).',
    'Do not add any explanation outside the code block.',
  ].filter(Boolean).join('\n');
}

function extractMarkdown(stdout: string): string {
  const match = stdout.match(/```markdown\n([\s\S]*?)```/);
  return match ? match[1].trim() : stdout.trim();
}

export function createCLIProvider(config: CLIProviderConfig): AIProvider {
  const buildArgs = CLI_ARGS[config.cliType];
  if (!buildArgs) throw new Error(`Unknown CLI type: ${config.cliType}`);

  return {
    id: config.id,
    name: `CLI: ${config.cliType} (${config.bin})`,

    analyze(req: AnalysisRequest): Promise<string> {
      return new Promise((resolve, reject) => {
        const prompt = buildPrompt(req);
        const proc = spawn(config.bin, buildArgs(prompt), { timeout: 300_000 });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
        proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
        proc.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(stderr.trim() || `${config.cliType} exited with code ${code}`));
          } else {
            resolve(extractMarkdown(stdout));
          }
        });
      });
    },
  };
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/cli-base.test.ts
```

Expected: `7 passed, 7 total`

- [ ] **Step 5: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/providers/cli-base.ts obsidian-plugins/vault-autopilot/tests/providers/cli-base.test.ts
git commit -m "feat: CLI provider base (claude, gemini, codex)"
```

---

## Task 3: OpenAI-compatible provider (TDD)

Covers: OpenRouter, OpenAI, Grok (api.x.ai/v1), DeepSeek, Groq, Ollama — all via one implementation.

**Files:**
- Create: `src/providers/openai-compat.ts`
- Create: `tests/providers/openai-compat.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/providers/openai-compat.test.ts`:

```typescript
import { createOpenAICompatProvider } from '../../src/providers/openai-compat';
import { AnalysisRequest } from '../../src/types';

// Mock the openai module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

import OpenAI from 'openai';
const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

const config = {
  id: 'p1', type: 'openai-compat' as const,
  label: 'OpenRouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: 'sk-or-test',
  model: 'openai/gpt-4o',
};

const imageRequest: AnalysisRequest = {
  filePath: '/tmp/test.png',
  fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  sopContent: 'Analyze the image.',
  meta: { source_url: 'https://example.com', title: 'Test' },
};

const textRequest: AnalysisRequest = {
  filePath: '/tmp/note.md',
  fileType: 'text',
  fileContent: Buffer.from('# My Note\nHello world'),
  sopContent: 'Summarize the text.',
  meta: {},
};

describe('createOpenAICompatProvider', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: '# Generated Note\nContent here' } }],
    });
    MockOpenAI.mockImplementation(() => ({ chat: { completions: { create: mockCreate } } }) as any);
  });

  test('id and name are set', () => {
    const p = createOpenAICompatProvider(config);
    expect(p.id).toBe('p1');
    expect(p.name).toContain('OpenRouter');
  });

  test('image request sends base64 image_url message', async () => {
    const p = createOpenAICompatProvider(config);
    const result = await p.analyze(imageRequest);
    expect(result).toBe('# Generated Note\nContent here');
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    expect(Array.isArray(userContent)).toBe(true);
    expect(userContent.some((c: any) => c.type === 'image_url')).toBe(true);
  });

  test('text request sends content as text', async () => {
    const p = createOpenAICompatProvider(config);
    await p.analyze(textRequest);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    expect(typeof userContent === 'string' || userContent.some((c: any) => c.type === 'text')).toBe(true);
  });

  test('throws when API returns no content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const p = createOpenAICompatProvider(config);
    await expect(p.analyze(imageRequest)).rejects.toThrow('no content');
  });

  test('initialises OpenAI client with correct baseURL', () => {
    createOpenAICompatProvider(config);
    expect(MockOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-or-test',
    }));
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/openai-compat.test.ts
```

Expected: `Cannot find module '../../src/providers/openai-compat'`

- [ ] **Step 3: Implement src/providers/openai-compat.ts**

```typescript
import OpenAI from 'openai';
import { AIProvider, AnalysisRequest, OpenAICompatProviderConfig } from '../types';

function imageToDataUrl(buf: Buffer): string {
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export function createOpenAICompatProvider(config: OpenAICompatProviderConfig): AIProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true, // required in Electron environment
  });

  return {
    id: config.id,
    name: `${config.label} (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const systemPrompt = req.sopContent;

      const userContent = req.fileType === 'image'
        ? [
            { type: 'text' as const, text: buildTextContext(req) },
            { type: 'image_url' as const, image_url: { url: imageToDataUrl(req.fileContent) } },
          ]
        : buildTextContext(req);

      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('API returned no content');
      return content.trim();
    },
  };
}

function buildTextContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  if (req.fileType === 'text') parts.push(`\nFile content:\n${req.fileContent.toString('utf8')}`);
  return parts.join('\n') || 'Analyze the attached file.';
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/openai-compat.test.ts
```

Expected: `5 passed, 5 total`

- [ ] **Step 5: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/providers/openai-compat.ts obsidian-plugins/vault-autopilot/tests/providers/openai-compat.test.ts
git commit -m "feat: OpenAI-compatible provider (OpenRouter, OpenAI, Grok, DeepSeek, Ollama)"
```

---

## Task 4: Anthropic + Gemini API providers (TDD)

**Files:**
- Create: `src/providers/anthropic.ts`
- Create: `src/providers/gemini-api.ts`
- Create: `tests/providers/anthropic.test.ts`
- Create: `tests/providers/gemini-api.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/providers/anthropic.test.ts`:

```typescript
import { createAnthropicProvider } from '../../src/providers/anthropic';
import { AnalysisRequest } from '../../src/types';

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn() },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

const config = { id: 'a1', type: 'anthropic' as const, apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6' };

const req: AnalysisRequest = {
  filePath: '/tmp/test.png', fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  sopContent: 'Analyze the image.', meta: {},
};

describe('createAnthropicProvider', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: '# Note\nContent' }],
    });
    MockAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } }) as any);
  });

  test('returns text from response', async () => {
    const p = createAnthropicProvider(config);
    const result = await p.analyze(req);
    expect(result).toBe('# Note\nContent');
  });

  test('sends image as base64 source block', async () => {
    const p = createAnthropicProvider(config);
    await p.analyze(req);
    const call = mockCreate.mock.calls[0][0];
    const userMsg = call.messages.find((m: any) => m.role === 'user');
    expect(userMsg.content.some((c: any) => c.type === 'image')).toBe(true);
  });

  test('throws when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    await expect(createAnthropicProvider(config).analyze(req)).rejects.toThrow('no text');
  });
});
```

Create `tests/providers/gemini-api.test.ts`:

```typescript
import { createGeminiAPIProvider } from '../../src/providers/gemini-api';
import { AnalysisRequest } from '../../src/types';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
  HarmCategory: {},
  HarmBlockThreshold: {},
}));

import { GoogleGenerativeAI } from '@google/generative-ai';
const MockGAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

const config = { id: 'g1', type: 'gemini-api' as const, apiKey: 'gai-test', model: 'gemini-1.5-flash' };

const req: AnalysisRequest = {
  filePath: '/tmp/img.png', fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50]),
  sopContent: 'Analyze.', meta: {},
};

describe('createGeminiAPIProvider', () => {
  let mockGenerate: jest.Mock;

  beforeEach(() => {
    mockGenerate = jest.fn().mockResolvedValue({
      response: { text: () => '# Gemini Note' },
    });
    MockGAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({ generateContent: mockGenerate }),
    }) as any);
  });

  test('returns generated text', async () => {
    const result = await createGeminiAPIProvider(config).analyze(req);
    expect(result).toBe('# Gemini Note');
  });

  test('sends image as inline data part', async () => {
    await createGeminiAPIProvider(config).analyze(req);
    const parts = mockGenerate.mock.calls[0][0];
    expect(parts.some((p: any) => p.inlineData)).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/anthropic.test.ts tests/providers/gemini-api.test.ts
```

Expected: `Cannot find module` for both provider files.

- [ ] **Step 3: Implement src/providers/anthropic.ts**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AnalysisRequest, AnthropicProviderConfig } from '../types';

export function createAnthropicProvider(config: AnthropicProviderConfig): AIProvider {
  const client = new Anthropic({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });

  return {
    id: config.id,
    name: `Anthropic (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const userContent: any[] = req.fileType === 'image'
        ? [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: req.fileContent.toString('base64') } },
            { type: 'text', text: buildContext(req) },
          ]
        : [{ type: 'text', text: `${buildContext(req)}\n\n${req.fileContent.toString('utf8')}` }];

      const response = await client.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: req.sopContent,
        messages: [{ role: 'user', content: userContent }],
      });

      const textBlock = response.content.find((b: any) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('Anthropic returned no text block');
      return (textBlock as any).text.trim();
    },
  };
}

function buildContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  return parts.join('\n') || 'Analyze the file.';
}
```

- [ ] **Step 4: Implement src/providers/gemini-api.ts**

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AnalysisRequest, GeminiAPIProviderConfig } from '../types';

export function createGeminiAPIProvider(config: GeminiAPIProviderConfig): AIProvider {
  const genAI = new GoogleGenerativeAI(config.apiKey);

  return {
    id: config.id,
    name: `Gemini API (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const model = genAI.getGenerativeModel({ model: config.model });
      const parts: any[] = [{ text: req.sopContent + '\n\n' + buildContext(req) }];

      if (req.fileType === 'image') {
        parts.push({ inlineData: { mimeType: 'image/png', data: req.fileContent.toString('base64') } });
      } else {
        parts[0].text += `\n\nFile content:\n${req.fileContent.toString('utf8')}`;
      }

      const result = await model.generateContent(parts);
      return result.response.text().trim();
    },
  };
}

function buildContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  return parts.join('\n');
}
```

- [ ] **Step 5: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/providers/anthropic.test.ts tests/providers/gemini-api.test.ts
```

Expected: `6 passed, 6 total`

- [ ] **Step 6: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/providers/anthropic.ts obsidian-plugins/vault-autopilot/src/providers/gemini-api.ts obsidian-plugins/vault-autopilot/tests/providers/
git commit -m "feat: Anthropic and Gemini API providers"
```

---

## Task 5: Path detector (TDD)

Auto-detects CLI binaries on Mac/Windows/Linux so users don't need to configure paths manually.

**Files:**
- Create: `src/path-detector.ts`
- Create: `tests/path-detector.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/path-detector.test.ts`:

```typescript
import * as fs from 'fs';
import { detectBinaryPath, KNOWN_PATHS } from '../src/path-detector';

jest.mock('fs');
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

describe('detectBinaryPath', () => {
  beforeEach(() => { mockExistsSync.mockReturnValue(false); });

  test('returns configured path if it exists', () => {
    mockExistsSync.mockImplementation((p) => p === '/custom/claude');
    expect(detectBinaryPath('claude', '/custom/claude')).toBe('/custom/claude');
  });

  test('returns first known path that exists when configured path not given', () => {
    const knownPath = KNOWN_PATHS['claude'][0];
    mockExistsSync.mockImplementation((p) => p === knownPath);
    expect(detectBinaryPath('claude', '')).toBe(knownPath);
  });

  test('returns binary name as fallback when nothing found', () => {
    expect(detectBinaryPath('claude', '')).toBe('claude');
  });

  test('KNOWN_PATHS has entries for claude, gemini, codex', () => {
    expect(KNOWN_PATHS['claude'].length).toBeGreaterThan(0);
    expect(KNOWN_PATHS['gemini'].length).toBeGreaterThan(0);
    expect(KNOWN_PATHS['codex'].length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/path-detector.test.ts
```

- [ ] **Step 3: Implement src/path-detector.ts**

```typescript
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const HOME = os.homedir();

export const KNOWN_PATHS: Record<string, string[]> = {
  claude: [
    // Mac - official installer
    path.join(HOME, '.claude', 'local', 'bin', 'claude'),
    // Homebrew / manual
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    path.join(HOME, '.local', 'bin', 'claude'),
    // Windows
    path.join(process.env['APPDATA'] || '', 'Claude', 'claude.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Claude', 'claude.exe'),
  ],
  gemini: [
    // npm global
    '/usr/local/bin/gemini',
    '/opt/homebrew/bin/gemini',
    path.join(HOME, '.npm-global', 'bin', 'gemini'),
    path.join(HOME, 'node_modules', '.bin', 'gemini'),
    // Windows npm global
    path.join(process.env['APPDATA'] || '', 'npm', 'gemini.cmd'),
  ],
  codex: [
    '/usr/local/bin/codex',
    '/opt/homebrew/bin/codex',
    path.join(HOME, '.npm-global', 'bin', 'codex'),
    // Windows
    path.join(process.env['APPDATA'] || '', 'npm', 'codex.cmd'),
  ],
};

/**
 * Returns the resolved path for a CLI binary.
 * Priority: configured path → known installation paths → bare name (rely on PATH at spawn time).
 */
export function detectBinaryPath(cliType: string, configured: string): string {
  if (configured && fs.existsSync(configured)) return configured;

  const candidates = KNOWN_PATHS[cliType] || [];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  return cliType; // fall back to bare name; spawn will look in PATH
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/path-detector.test.ts
```

Expected: `4 passed, 4 total`

- [ ] **Step 5: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/path-detector.ts obsidian-plugins/vault-autopilot/tests/path-detector.test.ts
git commit -m "feat: CLI binary path auto-detector for Mac/Windows/Linux"
```

---

## Task 6: File processor (TDD)

Reads a file, determines its type, calls the provider, returns markdown.

**Files:**
- Create: `src/processor.ts`
- Create: `tests/processor.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/processor.test.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { processFile, isSupportedFileType, readFileAsBuffer } from '../src/processor';
import { AIProvider, WatchRule } from '../src/types';

jest.mock('fs');
const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

const mockProvider: AIProvider = {
  id: 'p1', name: 'Mock',
  analyze: jest.fn().mockResolvedValue('# Generated Note\nContent'),
};

const rule: WatchRule = {
  id: 'r1', enabled: true,
  watchFolder: 'Inbox/screenshots',
  sopPath: '/vault/.obsidian/plugins/vault-autopilot/sop/test.md',
  outputFolder: 'Notes/Output',
  providerId: 'p1',
};

describe('isSupportedFileType', () => {
  test('accepts image extensions', () => {
    expect(isSupportedFileType('photo.png')).toBe(true);
    expect(isSupportedFileType('img.jpg')).toBe(true);
    expect(isSupportedFileType('anim.gif')).toBe(true);
    expect(isSupportedFileType('photo.webp')).toBe(true);
  });

  test('accepts text extensions', () => {
    expect(isSupportedFileType('note.md')).toBe(true);
    expect(isSupportedFileType('log.txt')).toBe(true);
  });

  test('rejects unsupported types', () => {
    expect(isSupportedFileType('video.mp4')).toBe(false);
    expect(isSupportedFileType('doc.pdf')).toBe(false);
    expect(isSupportedFileType('data.csv')).toBe(false);
  });
});

describe('processFile', () => {
  beforeEach(() => {
    mockReadFileSync.mockImplementation((filePath) => {
      if (String(filePath).endsWith('.md') || String(filePath).endsWith('sop')) return Buffer.from('# SOP\nDo analysis.');
      return Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic
    });
    mockExistsSync.mockReturnValue(true);
  });

  test('calls provider.analyze with correct request', async () => {
    await processFile('/vault/Inbox/screenshots/test.png', rule, mockProvider, {});
    expect(mockProvider.analyze).toHaveBeenCalledWith(expect.objectContaining({
      filePath: '/vault/Inbox/screenshots/test.png',
      fileType: 'image',
      sopContent: expect.stringContaining('SOP'),
    }));
  });

  test('returns markdown string from provider', async () => {
    const result = await processFile('/vault/Inbox/screenshots/test.png', rule, mockProvider, {});
    expect(result).toBe('# Generated Note\nContent');
  });

  test('passes meta when provided', async () => {
    await processFile('/vault/Inbox/test.png', rule, mockProvider, { source_url: 'https://x.com', title: 'T' });
    expect(mockProvider.analyze).toHaveBeenCalledWith(expect.objectContaining({
      meta: { source_url: 'https://x.com', title: 'T' },
    }));
  });

  test('throws when SOP file does not exist', async () => {
    mockExistsSync.mockImplementation((p) => !String(p).endsWith('test.md'));
    await expect(processFile('/vault/test.png', { ...rule, sopPath: '/missing/test.md' }, mockProvider, {}))
      .rejects.toThrow('SOP file not found');
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/processor.test.ts
```

- [ ] **Step 3: Implement src/processor.ts**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { AIProvider, AnalysisRequest, FileMeta, WatchRule } from './types';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const TEXT_EXTS  = new Set(['.md', '.txt']);

export function isSupportedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTS.has(ext) || TEXT_EXTS.has(ext);
}

export function readFileAsBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath) as Buffer;
}

export async function processFile(
  absoluteFilePath: string,
  rule: WatchRule,
  provider: AIProvider,
  meta: FileMeta,
): Promise<string> {
  if (!fs.existsSync(rule.sopPath)) {
    throw new Error(`SOP file not found: ${rule.sopPath}`);
  }

  const ext = path.extname(absoluteFilePath).toLowerCase();
  const fileType = IMAGE_EXTS.has(ext) ? 'image' : 'text';
  const fileContent = readFileAsBuffer(absoluteFilePath);
  const sopContent = fs.readFileSync(rule.sopPath, 'utf8');

  const request: AnalysisRequest = { filePath: absoluteFilePath, fileType, fileContent, sopContent, meta };
  return provider.analyze(request);
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/processor.test.ts
```

Expected: `8 passed, 8 total`

- [ ] **Step 5: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/processor.ts obsidian-plugins/vault-autopilot/tests/processor.test.ts
git commit -m "feat: file processor — read file, validate SOP, call provider"
```

---

## Task 7: HTTP server with token auth (TDD)

**Files:**
- Create: `src/server.ts`
- Create: `tests/server.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/server.test.ts`:

```typescript
import * as http from 'http';
import { createServer, ClipPayload } from '../src/server';

const PORT = 27191;
const TOKEN = 'test-secret-token-abc123';

async function request(method: string, urlPath: string, body?: unknown, token?: string): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`http://127.0.0.1:${PORT}${urlPath}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

describe('createServer', () => {
  let server: http.Server;
  let handler: jest.Mock;

  beforeEach((done) => {
    handler = jest.fn().mockResolvedValue(undefined);
    server = createServer(PORT, TOKEN, handler);
    server.on('listening', done);
  });

  afterEach((done) => { server.close(done); });

  test('POST /clip with valid token calls handler and returns success', async () => {
    const payload: ClipPayload = { image_base64: 'abc', source_url: 'https://x.com', title: 'T' };
    const { status, body } = await request('POST', '/clip', payload, TOKEN);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip without token returns 401', async () => {
    const { status } = await request('POST', '/clip', { image_base64: 'x', source_url: '', title: '' });
    expect(status).toBe(401);
    expect(handler).not.toHaveBeenCalled();
  });

  test('POST /clip with wrong token returns 403', async () => {
    const { status } = await request('POST', '/clip', { image_base64: 'x', source_url: '', title: '' }, 'wrong-token');
    expect(status).toBe(403);
  });

  test('OPTIONS /clip returns 204 with CORS headers', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/clip`, { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
  });

  test('handler error returns 500', async () => {
    handler.mockRejectedValue(new Error('disk error'));
    const { status, body } = await request('POST', '/clip', { image_base64: 'x', source_url: '', title: '' }, TOKEN);
    expect(status).toBe(500);
    expect(body.error).toContain('disk error');
  });

  test('unknown route returns 404', async () => {
    const { status } = await request('GET', '/unknown', undefined, TOKEN);
    expect(status).toBe(404);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/server.test.ts
```

- [ ] **Step 3: Implement src/server.ts**

```typescript
import * as http from 'http';

export interface ClipPayload {
  image_base64: string;
  source_url: string;
  title: string;
}

export type ClipHandler = (payload: ClipPayload) => Promise<void>;

export function createServer(port: number, token: string, onClip: ClipHandler): http.Server {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method !== 'POST' || req.url !== '/clip') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
      return;
    }

    const auth = req.headers['authorization'] || '';
    if (!auth) { res.writeHead(401, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Missing token' })); return; }
    if (auth !== `Bearer ${token}`) { res.writeHead(403, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Invalid token' })); return; }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body) as ClipPayload;
        await onClip(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: String(err) }));
      }
    });
  });

  server.listen(port, '127.0.0.1');
  return server;
}
```

- [ ] **Step 4: Run — expect all PASS**

```bash
cd obsidian-plugins/vault-autopilot && npx jest tests/server.test.ts
```

Expected: `6 passed, 6 total`

- [ ] **Step 5: Run full test suite**

```bash
cd obsidian-plugins/vault-autopilot && npx jest
```

Expected: `30+ passed, 0 failed`

- [ ] **Step 6: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/server.ts obsidian-plugins/vault-autopilot/tests/server.test.ts
git commit -m "feat: HTTP server with Bearer token auth"
```

---

## Task 8: Settings types + UI

**Files:**
- Create: `src/settings.ts`

- [ ] **Step 1: Create src/settings.ts**

```typescript
import * as crypto from 'crypto';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings, ProviderConfig, WatchRule } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
  rules: [],
  providers: [],
  httpServer: {
    enabled: true,
    port: 27183,
    token: crypto.randomBytes(32).toString('hex'),
  },
};

export class VaultAutopilotSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: VaultAutopilotPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── HTTP Server ────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('HTTP Server').setHeading();

    new Setting(containerEl)
      .setName('Enable HTTP server')
      .setDesc('Allows Chrome extension and other tools to drop files via POST /clip')
      .addToggle(t => t.setValue(this.plugin.settings.httpServer.enabled).onChange(async v => {
        this.plugin.settings.httpServer.enabled = v;
        await this.plugin.saveSettings();
        this.plugin.restartServer();
      }));

    new Setting(containerEl)
      .setName('Port')
      .setDesc('Default: 27183. Restart Obsidian after changing.')
      .addText(t => t.setValue(String(this.plugin.settings.httpServer.port)).onChange(async v => {
        const n = parseInt(v, 10);
        if (n > 1024 && n < 65536) { this.plugin.settings.httpServer.port = n; await this.plugin.saveSettings(); }
      }));

    new Setting(containerEl)
      .setName('Request token')
      .setDesc('Paste this token into your Chrome extension settings. Regenerate to invalidate old clients.')
      .addText(t => t.setValue(this.plugin.settings.httpServer.token).onChange(async v => {
        this.plugin.settings.httpServer.token = v.trim();
        await this.plugin.saveSettings();
      }))
      .addButton(b => b.setButtonText('Regenerate').onClick(async () => {
        this.plugin.settings.httpServer.token = crypto.randomBytes(32).toString('hex');
        await this.plugin.saveSettings();
        this.display();
        new Notice('Token regenerated. Update your Chrome extension.');
      }));

    // ── Providers ──────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('AI Providers').setHeading();
    new Setting(containerEl)
      .setName('Add provider')
      .setDesc('Configure at least one provider before creating rules.')
      .addDropdown(d => d
        .addOption('cli-claude', 'CLI: claude (Claude Code subscription)')
        .addOption('cli-gemini', 'CLI: gemini (Google account, free)')
        .addOption('cli-codex', 'CLI: codex (ChatGPT Plus subscription)')
        .addOption('openai-compat', 'API: OpenAI-compatible (OpenRouter / OpenAI / Grok / DeepSeek / Ollama)')
        .addOption('anthropic', 'API: Anthropic (Claude API)')
        .addOption('gemini-api', 'API: Google Gemini API')
      )
      .addButton(b => b.setButtonText('Add').onClick(async () => {
        const sel = containerEl.querySelector('select') as HTMLSelectElement;
        if (!sel) return;
        const type = sel.value;
        const id = crypto.randomBytes(4).toString('hex');
        let newProvider: ProviderConfig;
        if (type === 'openai-compat') {
          newProvider = { id, type: 'openai-compat', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', model: '' };
        } else if (type === 'anthropic') {
          newProvider = { id, type: 'anthropic', apiKey: '', model: 'claude-sonnet-4-6' };
        } else if (type === 'gemini-api') {
          newProvider = { id, type: 'gemini-api', apiKey: '', model: 'gemini-1.5-flash' };
        } else {
          const cliType = type.replace('cli-', '') as 'claude' | 'gemini' | 'codex';
          newProvider = { id, type: 'cli', cliType, bin: '' };
        }
        this.plugin.settings.providers.push(newProvider);
        await this.plugin.saveSettings();
        this.display();
      }));

    for (const [i, prov] of this.plugin.settings.providers.entries()) {
      this.renderProvider(containerEl, prov, i);
    }

    // ── Rules ──────────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('Watch Rules').setHeading();
    new Setting(containerEl)
      .setName('Add rule')
      .addButton(b => b.setButtonText('Add rule').onClick(async () => {
        const id = crypto.randomBytes(4).toString('hex');
        this.plugin.settings.rules.push({ id, enabled: true, watchFolder: '', sopPath: '', outputFolder: '', providerId: this.plugin.settings.providers[0]?.id || '' });
        await this.plugin.saveSettings();
        this.display();
      }));

    for (const [i, rule] of this.plugin.settings.rules.entries()) {
      this.renderRule(containerEl, rule, i);
    }
  }

  private renderProvider(el: HTMLElement, prov: ProviderConfig, i: number): void {
    const label = prov.type === 'cli' ? `CLI: ${prov.cliType}` : prov.type === 'openai-compat' ? `API: ${prov.label}` : `API: ${prov.type}`;
    new Setting(el).setName(label).setHeading();

    if (prov.type === 'cli') {
      new Setting(el)
        .setName('Binary path')
        .setDesc(`Leave empty to auto-detect. Example: /usr/local/bin/${prov.cliType}`)
        .addText(t => t.setValue(prov.bin).onChange(async v => {
          (this.plugin.settings.providers[i] as any).bin = v.trim();
          await this.plugin.saveSettings();
        }));
    }
    if (prov.type === 'openai-compat') {
      new Setting(el).setName('Label').addText(t => t.setValue(prov.label).onChange(async v => { (this.plugin.settings.providers[i] as any).label = v; await this.plugin.saveSettings(); }));
      new Setting(el).setName('Base URL').setDesc('e.g. https://openrouter.ai/api/v1').addText(t => t.setValue(prov.baseUrl).onChange(async v => { (this.plugin.settings.providers[i] as any).baseUrl = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('API Key').addText(t => t.setValue(prov.apiKey).onChange(async v => { (this.plugin.settings.providers[i] as any).apiKey = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('Model').setDesc('Must support vision for image analysis. e.g. gpt-4o, openai/gpt-4o').addText(t => t.setValue(prov.model).onChange(async v => { (this.plugin.settings.providers[i] as any).model = v.trim(); await this.plugin.saveSettings(); }));
    }
    if (prov.type === 'anthropic' || prov.type === 'gemini-api') {
      new Setting(el).setName('API Key').addText(t => t.setValue(prov.apiKey).onChange(async v => { (this.plugin.settings.providers[i] as any).apiKey = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('Model').addText(t => t.setValue(prov.model).onChange(async v => { (this.plugin.settings.providers[i] as any).model = v.trim(); await this.plugin.saveSettings(); }));
    }
    new Setting(el).addButton(b => b.setButtonText('Remove provider').onClick(async () => {
      this.plugin.settings.providers.splice(i, 1);
      await this.plugin.saveSettings();
      this.display();
    }));
  }

  private renderRule(el: HTMLElement, rule: WatchRule, i: number): void {
    new Setting(el).setName(`Rule ${i + 1}`).setHeading();
    new Setting(el).setName('Watch folder').setDesc('Vault-relative. e.g. Inbox/screenshots').addText(t => t.setValue(rule.watchFolder).onChange(async v => { this.plugin.settings.rules[i].watchFolder = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('SOP / prompt path').setDesc('Absolute path to the markdown file with instructions.').addText(t => t.setValue(rule.sopPath).onChange(async v => { this.plugin.settings.rules[i].sopPath = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('Output folder').setDesc('Vault-relative. e.g. Notes/Aesthetic').addText(t => t.setValue(rule.outputFolder).onChange(async v => { this.plugin.settings.rules[i].outputFolder = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('Provider').addDropdown(d => {
      this.plugin.settings.providers.forEach(p => d.addOption(p.id, p.type === 'cli' ? `CLI: ${(p as any).cliType}` : (p as any).label || p.type));
      d.setValue(rule.providerId).onChange(async v => { this.plugin.settings.rules[i].providerId = v; await this.plugin.saveSettings(); });
    });
    new Setting(el).setName('Enabled').addToggle(t => t.setValue(rule.enabled).onChange(async v => { this.plugin.settings.rules[i].enabled = v; await this.plugin.saveSettings(); }));
    new Setting(el).addButton(b => b.setButtonText('Remove rule').onClick(async () => {
      this.plugin.settings.rules.splice(i, 1);
      await this.plugin.saveSettings();
      this.display();
    }));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/settings.ts
git commit -m "feat: settings UI — rules list, provider config, HTTP server token"
```

---

## Task 9: Main plugin class + startup check

**Files:**
- Create: `src/startup-check.ts`
- Create: `src/main.ts`

- [ ] **Step 1: Create src/startup-check.ts**

```typescript
import * as fs from 'fs';
import { Notice } from 'obsidian';
import { detectBinaryPath } from './path-detector';
import { PluginSettings, CLIProviderConfig } from './types';

/**
 * Run on plugin load. Shows a Notice for each misconfiguration found.
 * Returns list of problem strings (empty = all good).
 */
export function runStartupChecks(settings: PluginSettings): string[] {
  const problems: string[] = [];

  // Check each provider
  for (const prov of settings.providers) {
    if (prov.type === 'cli') {
      const resolved = detectBinaryPath(prov.cliType, prov.bin);
      if (resolved === prov.cliType) {
        // fell back to bare name — binary not found in known paths
        problems.push(`CLI provider "${prov.cliType}": binary not found. Open plugin settings and set the full path.`);
      }
    } else if (prov.type === 'anthropic' || prov.type === 'gemini-api') {
      if (!prov.apiKey) problems.push(`Provider "${prov.type}": API key is empty.`);
      if (!prov.model) problems.push(`Provider "${prov.type}": model is empty.`);
    } else if (prov.type === 'openai-compat') {
      if (!prov.apiKey) problems.push(`Provider "${prov.label}": API key is empty.`);
      if (!prov.model) problems.push(`Provider "${prov.label}": model is empty.`);
      if (!prov.baseUrl) problems.push(`Provider "${prov.label}": base URL is empty.`);
    }
  }

  // Check each rule
  for (const rule of settings.rules) {
    if (!rule.enabled) continue;
    if (!rule.watchFolder) problems.push(`Rule "${rule.id}": watch folder is empty.`);
    if (!rule.sopPath) problems.push(`Rule "${rule.id}": SOP path is empty.`);
    else if (!fs.existsSync(rule.sopPath)) problems.push(`Rule "${rule.id}": SOP file not found at "${rule.sopPath}".`);
    if (!rule.outputFolder) problems.push(`Rule "${rule.id}": output folder is empty.`);
    if (!settings.providers.find(p => p.id === rule.providerId)) problems.push(`Rule "${rule.id}": assigned provider not found.`);
  }

  // Show as Notice (each problem gets its own so they don't stack-truncate)
  for (const p of problems) {
    new Notice(`Vault Autopilot: ${p}`, 10000);
  }

  return problems;
}
```

- [ ] **Step 2: Create src/main.ts**

```typescript
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as crypto from 'crypto';
import { Notice, Plugin, TFile } from 'obsidian';
import { DEFAULT_SETTINGS, VaultAutopilotSettingTab } from './settings';
import { PluginSettings, WatchRule, AIProvider, ProviderConfig } from './types';
import { createCLIProvider } from './providers/cli-base';
import { createOpenAICompatProvider } from './providers/openai-compat';
import { createAnthropicProvider } from './providers/anthropic';
import { createGeminiAPIProvider } from './providers/gemini-api';
import { detectBinaryPath } from './path-detector';
import { processFile, isSupportedFileType } from './processor';
import { createServer, ClipPayload } from './server';
import { runStartupChecks } from './startup-check';

export default class VaultAutopilotPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private server: http.Server | null = null;
  private providers = new Map<string, AIProvider>();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    this.rebuildProviders();
    runStartupChecks(this.settings);
    this.registerVaultWatcher();
    if (this.settings.httpServer.enabled) this.startServer();
  }

  onunload(): void {
    this.server?.close();
    this.server = null;
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, loaded);
    if (!this.settings.httpServer.token) {
      this.settings.httpServer.token = crypto.randomBytes(32).toString('hex');
      await this.saveData(this.settings);
    }
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.rebuildProviders();
  }

  restartServer(): void {
    this.server?.close();
    this.server = null;
    if (this.settings.httpServer.enabled) this.startServer();
  }

  private rebuildProviders(): void {
    this.providers.clear();
    for (const config of this.settings.providers) {
      this.providers.set(config.id, this.buildProvider(config));
    }
  }

  private buildProvider(config: ProviderConfig): AIProvider {
    if (config.type === 'cli') {
      const resolvedBin = detectBinaryPath(config.cliType, config.bin);
      return createCLIProvider({ ...config, bin: resolvedBin });
    }
    if (config.type === 'openai-compat') return createOpenAICompatProvider(config);
    if (config.type === 'anthropic') return createAnthropicProvider(config);
    if (config.type === 'gemini-api') return createGeminiAPIProvider(config);
    throw new Error(`Unknown provider type: ${(config as any).type}`);
  }

  private registerVaultWatcher(): void {
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (!(file instanceof TFile)) return;
        if (!isSupportedFileType(file.name)) return;
        const rule = this.findMatchingRule(file.path);
        if (!rule) return;
        this.handleNewFile(file, rule).catch((err) => {
          const msg = `Failed to process "${file.name}": ${err.message}`;
          new Notice(`Vault Autopilot: ${msg}`, 10000);
          this.appendError(msg);
        });
      }),
    );
  }

  private findMatchingRule(filePath: string): WatchRule | null {
    return this.settings.rules.find(
      (r) => r.enabled && filePath.startsWith(r.watchFolder + '/'),
    ) || null;
  }

  private async handleNewFile(file: TFile, rule: WatchRule): Promise<void> {
    const provider = this.providers.get(rule.providerId);
    if (!provider) throw new Error(`Provider "${rule.providerId}" not configured`);

    const vaultPath = (this.app.vault.adapter as any).getBasePath() as string;
    const absolutePath = path.join(vaultPath, file.path);

    // Read companion meta.json if it exists (written by Chrome extension or other clients)
    const meta = await this.readMeta(file.path);
    const markdown = await processFile(absolutePath, rule, provider, meta);

    // Write output note
    const stem = path.basename(file.name, path.extname(file.name));
    const outputPath = `${rule.outputFolder}/${stem}.md`;
    await this.ensureFolder(rule.outputFolder);
    await this.app.vault.create(outputPath, markdown);
  }

  private async readMeta(filePath: string): Promise<{ source_url?: string; title?: string }> {
    const metaPath = filePath.replace(/\.[^.]+$/, '.meta.json');
    const metaFile = this.app.vault.getAbstractFileByPath(metaPath);
    if (!(metaFile instanceof TFile)) return {};
    try {
      return JSON.parse(await this.app.vault.read(metaFile));
    } catch {
      return {};
    }
  }

  private async ensureFolder(folderPath: string): Promise<void> {
    const parts = folderPath.split('/');
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  private startServer(): void {
    const { port, token } = this.settings.httpServer;
    this.server = createServer(port, token, async (payload: ClipPayload) => {
      // Save image to vault inbox of first enabled rule that watches images
      const rule = this.settings.rules.find((r) => r.enabled);
      if (!rule) throw new Error('No enabled watch rules configured');
      const stem = `${Date.now()}-${sanitize(payload.title)}`;
      await this.ensureFolder(rule.watchFolder);
      const meta = JSON.stringify({ source_url: payload.source_url, title: payload.title });
      await this.app.vault.create(`${rule.watchFolder}/${stem}.meta.json`, meta);
      const bytes = Buffer.from(payload.image_base64, 'base64');
      await this.app.vault.createBinary(`${rule.watchFolder}/${stem}.png`, bytes.buffer as ArrayBuffer);
    });
    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        new Notice(`Vault Autopilot: Port ${port} is already in use. Close the other process or change the port in settings.`, 10000);
      }
    });
  }

  private async appendError(message: string): Promise<void> {
    const logPath = 'vault-autopilot-errors.md';
    const timestamp = new Date().toISOString();
    const line = `- ${timestamp}: ${message}\n`;
    const existing = this.app.vault.getAbstractFileByPath(logPath);
    if (existing instanceof TFile) {
      const content = await this.app.vault.read(existing);
      await this.app.vault.modify(existing, content + line);
    } else {
      await this.app.vault.create(logPath, `# Vault Autopilot Errors\n\n${line}`);
    }
  }
}

function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}
```

- [ ] **Step 3: Build**

```bash
cd obsidian-plugins/vault-autopilot && npm run build
```

Expected: `main.js` created, no TypeScript errors.

- [ ] **Step 4: Run full test suite**

```bash
cd obsidian-plugins/vault-autopilot && npx jest
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add obsidian-plugins/vault-autopilot/src/startup-check.ts obsidian-plugins/vault-autopilot/src/main.ts obsidian-plugins/vault-autopilot/main.js
git commit -m "feat: main plugin class — vault watcher, provider registry, HTTP server, error log"
```

---

## Task 10: Chrome extension — add token support

> **Read before editing:** `extension/background.js` (full file), `extension/popup.html`, `extension/popup.js`.

- [ ] **Step 1: popup.html — add token input field**

After the `#settings-error` div, add:

```html
  <div class="section-title">插件连接</div>
  <div class="setting-row">
    <label for="plugin_token">Token</label>
    <input id="plugin_token" type="password" placeholder="从 Obsidian 插件设置里复制">
  </div>
```

- [ ] **Step 2: popup.js — save and load token**

In `SETTING_KEYS`, the file currently has no keys (they were removed in v2). Add:

```javascript
const SETTING_KEYS = { plugin_token: '' };
```

Add load block after the existing error-display block:

```javascript
chrome.storage.local.get(SETTING_KEYS, (stored) => {
  document.getElementById('plugin_token').value = stored.plugin_token || '';
});
```

Add auto-save listener:

```javascript
document.getElementById('plugin_token').addEventListener('input', () => {
  chrome.storage.local.set({ plugin_token: document.getElementById('plugin_token').value.trim() });
});
```

- [ ] **Step 3: background.js — read token and add Authorization header**

In `handleRegion`, the settings load block was removed in v2. Add it back (token only):

```javascript
  const { plugin_token } = await new Promise(resolve =>
    chrome.storage.local.get({ plugin_token: '' }, resolve)
  );

  let response;
  try {
    response = await httpPost({
      image_base64: croppedB64,
      source_url: msg.source_url,
      title: sanitize(msg.title),
    }, plugin_token);
```

Update `httpPost` to accept and send the token:

```javascript
async function httpPost(msg, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const resp = await fetch('http://127.0.0.1:27183/clip', {
    method: 'POST',
    headers,
    body: JSON.stringify(msg),
  });
  if (resp.status === 401 || resp.status === 403) throw new Error('Token 无效，请检查 Obsidian 插件设置里的 Token');
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
```

- [ ] **Step 4: Reload extension in Chrome and verify no errors**

Open `chrome://extensions` → Reload Screenshot Clipper → confirm no red error banner.

- [ ] **Step 5: Commit**

```bash
git add extension/background.js extension/popup.html extension/popup.js
git commit -m "feat: extension sends Bearer token to Obsidian plugin for auth"
```

---

## Task 11: Install and smoke test

- [ ] **Step 1: Install plugin**

```bash
VAULT="$HOME/Documents/Obsidian Vault"
PLUGIN="$VAULT/.obsidian/plugins/vault-autopilot"
mkdir -p "$PLUGIN"
cp obsidian-plugins/vault-autopilot/main.js "$PLUGIN/"
cp obsidian-plugins/vault-autopilot/manifest.json "$PLUGIN/"
```

In Obsidian: Settings → Community Plugins → enable "Vault Autopilot".

- [ ] **Step 2: Configure a rule**

In plugin settings:
1. Add provider: pick "CLI: claude", leave binary path empty (auto-detect)
2. Add rule: Watch folder = `Inbox/screenshots`, SOP path = `/full/path/to/sop/处理审美-SOP.md`, Output folder = `AI协作/05 审美积累/单张分析`, Provider = claude CLI

- [ ] **Step 3: Copy token to Chrome extension**

Copy the token from plugin settings → open Chrome extension popup → paste into Token field.

- [ ] **Step 4: Verify server is listening with auth**

```bash
# No token — expect 401
curl -s -o /dev/null -w "%{http_code}" -X POST http://127.0.0.1:27183/clip -H "Content-Type: application/json" -d '{}'
# Expected: 401

# With token — expect 200
TOKEN=$(cat "$HOME/Documents/Obsidian Vault/.obsidian/plugins/vault-autopilot/data.json" | python3 -c "import json,sys; print(json.load(sys.stdin)['httpServer']['token'])")
B64=$(base64 -i extension/icons/icon48.png | tr -d '\n')
curl -s -X POST http://127.0.0.1:27183/clip \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"image_base64\":\"$B64\",\"source_url\":\"https://example.com\",\"title\":\"Smoke Test\"}"
# Expected: {"success":true}
```

- [ ] **Step 5: Verify AI analysis runs**

Within 30–90 seconds: new `.md` file appears in `AI協作/05 審美積累/單張分析/`. Open it and confirm the 五个问题 structure with objective fields filled.

- [ ] **Step 6: Test Chrome extension end-to-end**

1. Open a webpage in Chrome
2. Click extension icon → Clip
3. Draw selection
4. Expected: green "✓ 已保存到 Obsidian"
5. Expected: note appears in vault within ~90 seconds

- [ ] **Step 7: Test Obsidian closed error path**

1. Quit Obsidian
2. Try to clip
3. Expected: red "✗ Obsidian 未运行，请先打开 Obsidian"

- [ ] **Step 8: Test wrong token**

Change token in extension popup to a wrong value → clip → Expected: red "✗ Token 无效，请检查 Obsidian 插件设置里的 Token"

- [ ] **Step 9: Final commit**

```bash
git add .
git commit -m "feat: vault-autopilot — general file-watcher AI analysis plugin, complete"
```

---

## Self-Review

**Spec coverage:**

| Requirement | Task |
|------------|------|
| New file → SOP → AI → note | Tasks 6, 9 |
| Multiple rules (N folders, N SOPs) | Task 8 (settings), Task 9 (watcher) |
| Images + plain text | Task 6 (`isSupportedFileType`) |
| CLI providers (claude/gemini/codex) | Task 2 |
| API providers (OpenRouter/OpenAI/Grok/DeepSeek/Ollama) | Task 3 |
| API providers (Anthropic, Gemini) | Task 4 |
| Cross-platform CLI path detection | Task 5 |
| Startup self-check with Notice | Task 9 (`startup-check.ts`) |
| HTTP server token auth | Task 7 |
| Port conflict Notice | Task 9 (`main.ts` server error handler) |
| Error persistence (`vault-autopilot-errors.md`) | Task 9 (`appendError`) |
| Chrome extension token | Task 10 |
| Multiple vault conflict Notice | Covered by port conflict handler |

**Placeholder scan:** No TBDs. No "handle edge cases" stubs. No "similar to Task N" shortcuts.

**Type consistency:**
- `AnalysisRequest` defined Task 1, used in Tasks 2, 3, 4, 6 ✓
- `AIProvider.analyze(AnalysisRequest)` defined Task 1, implemented Tasks 2–4, called Task 6 ✓
- `WatchRule` defined Task 1, used Tasks 8, 9 ✓
- `ClipPayload` defined Task 7 (`server.ts`), consumed Task 9 (`main.ts`) ✓
- `createCLIProvider` signature consistent across Tasks 2 and 9 ✓
