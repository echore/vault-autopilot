# Bilingual (en/zh) i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All user-visible text (settings UI, Notices, generated note content, README) supports English and Chinese, switchable via a settings dropdown.

**Architecture:** A zero-dependency `t()` function reads flat key/value locale JSON files (`src/locales/en.json`, `src/locales/zh.json`) that esbuild bundles into `main.js` at build time. `SectionKind` becomes language-neutral (`'cover' | 'content' | 'motion' | 'screenshot'`); note parsing recognizes headings in **both** languages forever, while writing uses the current language.

**Tech Stack:** TypeScript, esbuild (native JSON import), jest/ts-jest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-13-bilingual-i18n-design.md`

## Global Constraints

- Languages: exactly `'en' | 'zh'`. Default: `'en'`.
- Writing uses the current language; parsing recognizes both languages unconditionally.
- Locale strings live only in `src/locales/en.json` and `src/locales/zh.json`; no runtime file loading (community store only distributes main.js/manifest.json/styles.css).
- No new npm dependencies.
- Heading-label locale values (`note.heading.*`) must not contain regex metacharacters (`renumber()` builds a RegExp from them; enforced by a test).
- TDD for Tasks 1–3. Task 4 (settings UI + main.ts wiring) and Task 5 (README) follow the project convention: implement, verify `npm test` + `tsc --noEmit`, commit.
- One commit per task. Never merge tasks into one commit.
- Run all commands from the repo root: `/Users/liyachen/Documents/fang/vault-autopilot`.

---

### Task 1: i18n module + locale files

**Files:**
- Create: `src/locales/en.json`
- Create: `src/locales/zh.json`
- Create: `src/i18n.ts`
- Modify: `tsconfig.json` (add `resolveJsonModule`)
- Test: `tests/i18n.test.ts` (create)

**Interfaces:**
- Consumes: nothing (leaf module; imports only the two JSON files).
- Produces (all later tasks rely on these exact signatures):
  - `type Language = 'en' | 'zh'`
  - `type LocaleKey = keyof typeof en` (string-literal union of all keys)
  - `setLanguage(lang: Language): void`
  - `t(key: LocaleKey, vars?: Record<string, string | number>): string` — `{name}` placeholders replaced from `vars`
  - `variants(key: LocaleKey): string[]` — that key's value in every language (used for dual-language parsing)

- [ ] **Step 1: Write the failing test**

Create `tests/i18n.test.ts`:

```typescript
import { t, setLanguage, variants } from '../src/i18n';
import en from '../src/locales/en.json';
import zh from '../src/locales/zh.json';

afterEach(() => setLanguage('en'));

test('en and zh have identical key sets', () => {
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
});

test('t returns English by default', () => {
  expect(t('settings.storageHeading')).toBe('Storage locations');
});

test('t returns Chinese after setLanguage', () => {
  setLanguage('zh');
  expect(t('settings.storageHeading')).toBe('存储位置');
});

test('t interpolates {vars}', () => {
  expect(t('notice.savedTo', { folder: 'Clips/Videos' })).toContain('Clips/Videos');
  expect(t('notice.savedTo', { folder: 'Clips/Videos' })).not.toContain('{folder}');
});

test('variants returns the value from every language', () => {
  expect(variants('note.heading.cover').sort()).toEqual(['Cover & Title', '封面标题'].sort());
});

test('heading labels contain no regex metacharacters', () => {
  // renumber() builds a RegExp from these labels — keep them literal.
  const headingKeys = ['note.heading.cover', 'note.heading.content', 'note.heading.motion', 'note.heading.screenshot'] as const;
  for (const key of headingKeys) {
    for (const label of variants(key)) {
      expect(label).not.toMatch(/[\\^$.*+?()[\]{}|]/);
    }
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/i18n.test.ts`
Expected: FAIL — cannot find module `../src/i18n` (and the JSON files).

- [ ] **Step 3: Add `resolveJsonModule` to tsconfig.json**

In `tsconfig.json`, add one line inside `compilerOptions` (keep everything else unchanged):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "CommonJS",
    "target": "ES2018",
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "lib": ["ES2018", "DOM"],
    "types": ["node", "jest"]
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create the locale files**

Create `src/locales/en.json` (complete file):

```json
{
  "settings.language": "Language",
  "settings.storageHeading": "Storage locations",
  "settings.videoNotesFolder.name": "Video notes folder",
  "settings.videoNotesFolder.desc": "One note per video: cover, hook, and keyframe clips all merge into the same note. Default: Clips/Videos",
  "settings.coverFolder.name": "Cover images folder",
  "settings.coverFolder.desc": "Video cover images (<video ID>.webp). Default: Clips/Videos/covers",
  "settings.framesFolder.name": "Frame images folder",
  "settings.framesFolder.desc": "Frames extracted by hook / keyframe clips. Default: Clips/Videos/frames",
  "settings.screenshotFolder.name": "Screenshots folder",
  "settings.screenshotFolder.desc": "Webpage screenshots become standalone notes stored here; images go into its frames/ subfolder. Default: Clips/Screenshots",
  "settings.advancedHeading": "Advanced",
  "settings.httpEnable.name": "Enable HTTP server",
  "settings.httpEnable.desc": "Receives content sent by the Chrome extension via POST /clip",
  "settings.port.name": "Port",
  "settings.port.desc": "Default 17183. Only change it if the port is taken; after changing, set the same value on the extension's welcome page (Advanced → Port), or the two sides will disconnect. Restart Obsidian afterwards.",
  "settings.maxFrames.name": "Max frames",
  "settings.maxFrames.desc": "Maximum frames kept per hook / keyframe clip (1–20). Default 5.",
  "settings.sop.thumbnail": "Cover SOP path",
  "settings.sop.screenshot": "Screenshot SOP path",
  "settings.sop.hook": "Hook SOP path",
  "settings.sop.keyframe": "Keyframe SOP path",
  "settings.sop.desc": "Leave empty for material-only mode (no analysis prompt). Absolute path to a markdown file inside the vault.",
  "notice.savedTo": "Saved to {folder}\nWant a different location? Settings → Vault Autopilot → Storage locations",
  "notice.portInUse": "Vault Autopilot: port {port} is already in use. Quit the program using it, or set the same new port in both the plugin settings and the extension settings.",
  "notice.sectionExists": "\"{section}\" already exists — not overwritten. To redo it, delete that section first, then clip again.",
  "error.screenshotFolderNotConfigured": "Screenshots folder not configured: set it in Settings → Vault Autopilot → Storage locations → Screenshots folder.",
  "error.videoFolderNotConfigured": "Video notes folder or cover images folder not configured: set them in Settings → Vault Autopilot → Storage locations.",
  "note.heading.cover": "Cover & Title",
  "note.heading.content": "Content",
  "note.heading.motion": "Motion",
  "note.heading.screenshot": "Screenshots",
  "note.transcript": "Transcript",
  "note.source": "Source: {url}",
  "note.screenshotCallout": "Screenshots",
  "note.notesHeading": "Notes",
  "note.videoFallback": "Video",
  "note.openOriginal": "▶ Open original video",
  "note.sopCalloutTitle": "Analysis prompt",
  "note.sopDone": "When done:",
  "note.sopStep1": "Analysis written into the note's sections",
  "note.sopStep2": "Delete this entire prompt block",
  "note.framesCalloutTitle": "Frames for analysis",
  "note.framesChecklist": "Complete the analysis per the SOP and fill in the sections"
}
```

Create `src/locales/zh.json` (complete file — values are the **exact** strings currently hardcoded in the source; do not reword them):

```json
{
  "settings.language": "语言",
  "settings.storageHeading": "存储位置",
  "settings.videoNotesFolder.name": "视频笔记文件夹",
  "settings.videoNotesFolder.desc": "一个视频一条笔记：封面、Hook、关键帧都写进同一条。默认 Clips/Videos",
  "settings.coverFolder.name": "封面图片文件夹",
  "settings.coverFolder.desc": "视频封面图（<视频ID>.webp）。默认 Clips/Videos/covers",
  "settings.framesFolder.name": "帧图片文件夹",
  "settings.framesFolder.desc": "Hook / 关键帧抽出的帧图。默认 Clips/Videos/frames",
  "settings.screenshotFolder.name": "截图文件夹",
  "settings.screenshotFolder.desc": "普通网页截图独立成笔记，存在这里；图片自动放入其 frames/ 子文件夹。默认 Clips/Screenshots",
  "settings.advancedHeading": "高级",
  "settings.httpEnable.name": "启用 HTTP 服务",
  "settings.httpEnable.desc": "接收 Chrome 扩展通过 POST /clip 发来的内容",
  "settings.port.name": "端口",
  "settings.port.desc": "默认 17183。仅当端口被占用时才需要改；改完必须在扩展的引导页（高级 → 端口）改成同一个值，否则两边会断开。改后重启 Obsidian。",
  "settings.maxFrames.name": "抽帧数量上限",
  "settings.maxFrames.desc": "Hook / 关键帧模式最多保存几帧（1–20）。默认 5。",
  "settings.sop.thumbnail": "封面 SOP 路径",
  "settings.sop.screenshot": "截图 SOP 路径",
  "settings.sop.hook": "Hook SOP 路径",
  "settings.sop.keyframe": "关键帧 SOP 路径",
  "settings.sop.desc": "留空 = 纯素材模式（不附带分析提示）。填 vault 内 markdown 文件的绝对路径。",
  "notice.savedTo": "已存到 {folder}\n想换位置？设置 → Vault Autopilot → 存储位置",
  "notice.portInUse": "Vault Autopilot：端口 {port} 被占用。请关闭占用它的程序；或在插件设置和扩展设置两处改成同一个新端口。",
  "notice.sectionExists": "「{section}」已存在，未覆盖。想重做请先删掉该小节再点。",
  "error.screenshotFolderNotConfigured": "截图文件夹未配置：请在 设置 → Vault Autopilot → 存储位置 → 截图文件夹 填写。",
  "error.videoFolderNotConfigured": "视频笔记文件夹或封面图片文件夹未配置：请在 设置 → Vault Autopilot → 存储位置 填写。",
  "note.heading.cover": "封面标题",
  "note.heading.content": "内容",
  "note.heading.motion": "动效",
  "note.heading.screenshot": "截图",
  "note.transcript": "字幕",
  "note.source": "来源：{url}",
  "note.screenshotCallout": "截图",
  "note.notesHeading": "笔记",
  "note.videoFallback": "视频",
  "note.openOriginal": "▶ 跳转原视频",
  "note.sopCalloutTitle": "分析提示",
  "note.sopDone": "完成后执行：",
  "note.sopStep1": "分析已写入笔记各章节",
  "note.sopStep2": "删除此整个提示块",
  "note.framesCalloutTitle": "分析用帧",
  "note.framesChecklist": "按 SOP 完成分析，填入各章节"
}
```

- [ ] **Step 5: Create `src/i18n.ts`** (complete file):

```typescript
import en from './locales/en.json';
import zh from './locales/zh.json';

export type Language = 'en' | 'zh';
export type LocaleKey = keyof typeof en;

// Typed as Record<LocaleKey, string> so a key missing from zh.json is a compile error.
const locales: Record<Language, Record<LocaleKey, string>> = { en, zh };

let current: Language = 'en';

export function setLanguage(lang: Language): void {
  current = lang;
}

export function t(key: LocaleKey, vars?: Record<string, string | number>): string {
  let s = locales[current][key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

// Every language's value for a key — parsing must recognize notes written
// under any language setting, not just the current one.
export function variants(key: LocaleKey): string[] {
  return (Object.keys(locales) as Language[]).map((l) => locales[l][key]);
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest tests/i18n.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Verify the whole suite and TypeScript**

Run: `npm test` — expected: all suites pass (nothing else imports i18n yet).
Run: `npx tsc --noEmit` — expected: no output.

- [ ] **Step 8: Commit**

```bash
git add src/locales/en.json src/locales/zh.json src/i18n.ts tsconfig.json tests/i18n.test.ts
git commit -m "feat: i18n module with bundled en/zh locale files"
```

---

### Task 2: Dual-language note generation (video-note.ts refactor)

`SectionKind` currently uses Chinese heading literals as both internal id and display text. Split those roles: neutral ids, per-language heading labels, parsing that recognizes both languages.

**Files:**
- Modify: `src/video-note.ts` (full rewrite of the language-coupled parts — complete new file below)
- Modify: `src/util.ts:71` (the `[▶ 跳转原视频]` fallback link)
- Modify: `src/clip-router.ts:55` (notice shows a display label, not the neutral kind id)
- Test: `tests/video-note.test.ts` (adapt existing + add en/mixed cases)
- Test: `tests/clip-router.test.ts` (pin existing suites to zh so their Chinese assertions stay valid)
- Test: `tests/util.test.ts` (only if it asserts the fallback-link text — it currently does not; verify)

**Interfaces:**
- Consumes: `t(key, vars?)`, `variants(key)`, `LocaleKey` from `src/i18n.ts` (Task 1).
- Produces:
  - `export type SectionKind = 'cover' | 'content' | 'motion' | 'screenshot'` (breaking change — all previous Chinese literals gone)
  - `export function headingLabel(kind: SectionKind): string` — current-language display label (clip-router uses this for the skip notice)
  - All existing exports keep their signatures: `coverSection`, `hookSection`, `keyframeSection`, `screenshotSection`, `buildAnchor`, `mergeSection`, `circledNumber`, `sopBlock`.

- [ ] **Step 1: Write the failing tests**

In `tests/video-note.test.ts`:

(a) Add to the imports at the top, and pin the existing tests to Chinese (they assert Chinese output verbatim — they become the zh + legacy-note regression suite):

```typescript
import { setLanguage } from '../src/i18n';

beforeEach(() => setLanguage('zh'));
afterEach(() => setLanguage('en'));
```

(b) Change the single neutral-kind assertion at line 101 from `expect(s.kind).toBe('内容');` to:

```typescript
  expect(s.kind).toBe('content');
```

(c) Append this new describe block at the end of the file:

```typescript
describe('bilingual headings', () => {
  const bMeta: VideoNoteMeta = {
    platform: 'youtube', videoId: 'abc123',
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
    title: 'Bee Keeper', channel: 'NatureCh',
  };

  test('English mode writes English headings and dimensions', () => {
    setLanguage('en');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, coverSection('cover.webp')).content;
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['k.png'] })).content;
    expect(c).toContain('## 🖼️ Cover & Title');
    expect(c).toContain('## ✨ Motion ① · 45s–52s');
    expect(c).toContain('dimensions: [Cover & Title, Motion]');
  });

  test('English section appended to a Chinese note: recognized, ordered, renumbered', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['a.png'] })).content;
    setLanguage('en');
    const note = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['b.png'] })).content;
    // Chinese hook still recognized and stays before both motion sections
    expect(note.indexOf('## 🎬 内容')).toBeGreaterThanOrEqual(0);
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('Motion'));
    // Mixed-language motion sections renumber as one sequence, sorted by start time
    expect(note).toContain('## ✨ Motion ① · 45s–52s');
    expect(note).toContain('## ✨ 动效 ② · 130s–138s');
  });

  test('singular-section skip works across languages', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
    setLanguage('en');
    const r = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f2.png'] }));
    expect(r.skipped).toBe(true);
  });

  test('dimensions dedupe by kind across languages', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['a.png'] })).content;
    setLanguage('en');
    const note = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['b.png'] })).content;
    // motion is already listed as 动效 — appending an English Motion section must not add a second entry
    expect(note).toContain('dimensions: [动效]');
    expect(note).not.toContain('dimensions: [动效, Motion]');
  });
});
```

In `tests/clip-router.test.ts`, after the imports add (its suites assert Chinese note content):

```typescript
import { setLanguage } from '../src/i18n';

beforeEach(() => setLanguage('zh'));
afterAll(() => setLanguage('en'));
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx jest tests/video-note.test.ts`
Expected: FAIL — TypeScript errors (`'content'` not assignable to `SectionKind`) and/or the four new tests failing.

- [ ] **Step 3: Rewrite `src/video-note.ts`** (complete new file):

```typescript
import { buildVideoEmbed, sanitize } from './util';
import { t, variants, LocaleKey } from './i18n';

export type SectionKind = 'cover' | 'content' | 'motion' | 'screenshot';

// Display order of sections in a note; index doubles as the sort rank.
const KINDS: SectionKind[] = ['cover', 'content', 'motion', 'screenshot'];
const HEADING_KEY: Record<SectionKind, LocaleKey> = {
  cover: 'note.heading.cover',
  content: 'note.heading.content',
  motion: 'note.heading.motion',
  screenshot: 'note.heading.screenshot',
};
const EMOJI: Record<SectionKind, string> = { cover: '🖼️', content: '🎬', motion: '✨', screenshot: '📸' };

export function headingLabel(kind: SectionKind): string {
  return t(HEADING_KEY[kind]);
}

function labelVariants(kind: SectionKind): string[] {
  return variants(HEADING_KEY[kind]);
}

// Exact-match a frontmatter dimension label (either language) back to its kind.
function labelToKind(label: string): SectionKind | null {
  for (const k of KINDS) if (labelVariants(k).includes(label)) return k;
  return null;
}

export interface VideoNoteMeta {
  platform: string;
  videoId: string;
  videoUrl: string;
  title: string;
  channel?: string | null;
}

export interface NewSection {
  kind: SectionKind;
  startSeconds: number;
  text: string; // full "## heading\n...body" block; motion heading uses ① placeholder
}

export function circledNumber(i: number): string {
  return i >= 1 && i <= 20 ? String.fromCodePoint(0x2460 + i - 1) : `(${i})`;
}

export function sopBlock(sopContent: string): string {
  const lines = sopContent.split('\n').map((l) => `> ${l}`).join('\n');
  const checklist = ['> ', '> ---', `> **${t('note.sopDone')}**`, `> - [ ] ${t('note.sopStep1')}`, `> - [ ] ${t('note.sopStep2')}`].join('\n');
  return `> [!TIP] ${t('note.sopCalloutTitle')}\n${lines}\n${checklist}`;
}

function framesBlock(frameNames: string[]): string {
  const lines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join('\n');
  return `> [!NOTE] ${t('note.framesCalloutTitle')}\n${lines}\n> \n> - [ ] ${t('note.framesChecklist')}`;
}

export function coverSection(coverFile: string, sop?: string): NewSection {
  const parts = [`## ${headingLabel('cover')}`, ``, `![[${coverFile}]]`, ``];
  if (sop) parts.push(sopBlock(sop), ``);
  return { kind: 'cover', startSeconds: 0, text: parts.join('\n') };
}

export function hookSection(
  p: { url: string; platform?: string; endSeconds: number; frameNames: string[]; transcript?: string; aiResult?: string },
  sop?: string,
): NewSection {
  // Hook is always at the very front — embed the whole video from the start
  // (no end cap; the captured cut-off point doesn't matter for a hook).
  const embed = buildVideoEmbed(p.url, p.platform, 0);
  const parts = [`## ${headingLabel('content')}`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (p.transcript) parts.push(`### ${t('note.transcript')}`, ``, p.transcript, ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: 'content', startSeconds: 0, text: parts.join('\n') };
}

export function keyframeSection(
  p: { url: string; platform?: string; start: number; end: number; frameNames: string[]; aiResult?: string },
  sop?: string,
): NewSection {
  // Cue the player to the START of this segment (no end cap).
  const embed = buildVideoEmbed(p.url, p.platform, p.start);
  // Integer seconds in the heading: clean display + parseable for re-sorting.
  const parts = [`## ${headingLabel('motion')} ① · ${Math.floor(p.start)}s–${Math.round(p.end)}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: 'motion', startSeconds: p.start, text: parts.join('\n') };
}

export function screenshotSection(imageNames: string[], sop?: string, aiResult?: string): NewSection {
  const imgs = imageNames.map((n) => `![[${n}]]`).join('\n');
  const parts = [`## ${headingLabel('screenshot')} ①`, ``, imgs, ``];
  if (aiResult) parts.push(aiResult, ``);
  else if (sop) parts.push(sopBlock(sop), ``);
  return { kind: 'screenshot', startSeconds: 0, text: parts.join('\n') };
}

export function buildAnchor(meta: VideoNoteMeta): string {
  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    `---`, `type: video`, `platform: ${meta.platform}`,
    `video_id: "${meta.videoId}"`, `video_url: "${meta.videoUrl}"`,
    `title: "${meta.title}"`,
    ...(meta.channel ? [`channel: "${meta.channel}"`] : []),
    `dimensions: []`, `analyzed_at: ${today}`, `tags: []`, `depth: normal`, `---`,
  ].join('\n');
  return `${fm}\n\n# ${meta.title}\n`;
}

interface ParsedSection { kind: SectionKind; startSeconds: number; text: string; }

function kindOf(heading: string): SectionKind | null {
  // Substring match so an emoji prefix (## 🎬 内容) still resolves to its kind.
  // Both languages are checked so notes written under either setting keep parsing.
  for (const k of KINDS) {
    for (const label of labelVariants(k)) {
      if (heading.includes(label)) return k;
    }
  }
  return null;
}

// Force every heading to `## <emoji> <label…>`, upgrading old headings (no emoji)
// and de-duplicating any existing emoji, so the note stays visually consistent.
// The heading keeps whatever language it was written in.
function emojiHeading(text: string, kind: SectionKind): string {
  return text.replace(/^## .*$/m, (line) => {
    const heading = line.slice(3);
    let tail = headingLabel(kind);
    for (const label of labelVariants(kind)) {
      const idx = heading.indexOf(label);
      if (idx >= 0) { tail = heading.slice(idx); break; }
    }
    return `## ${EMOJI[kind]} ${tail}`;
  });
}

// Drop a trailing horizontal rule (the inter-section separator) plus surrounding
// whitespace, so re-rendering never stacks `---` lines across merges.
function stripTrailingRule(t: string): string {
  return t.replace(/\s+$/, '').replace(/\n-{3,}$/, '').replace(/\s+$/, '');
}

// Rebuild the top [!abstract] overview from the frontmatter + the dimensions
// currently present, preserving any other preamble the user added.
function syncOverview(head: string, frontmatter: string, dims: SectionKind[]): string {
  const channel = frontmatter.match(/^channel:\s*"?(.*?)"?\s*$/m)?.[1];
  const platform = frontmatter.match(/^platform:\s*(.*?)\s*$/m)?.[1];
  const label = [channel, platform].filter(Boolean).join(' · ') || t('note.videoFallback');
  const overview = `> [!abstract] ${label}\n> ${dims.map((d) => `${EMOJI[d]} ${headingLabel(d)}`).join(' · ')}`;
  const cleaned = head.replace(/\n*> \[!abstract\][^\n]*(?:\n>[^\n]*)*/g, '');
  if (/^# .+$/m.test(cleaned)) return cleaned.replace(/^(# .+)$/m, `$1\n\n${overview}`);
  return `${cleaned.replace(/\s+$/, '')}\n\n${overview}`;
}

function parseSections(body: string): { head: string; sections: ParsedSection[] } {
  const lines = body.split('\n');
  const head: string[] = [];
  const sections: ParsedSection[] = [];
  let cur: string[] | null = null;
  let curHeading = '';
  const flush = () => {
    if (cur) {
      const kind = kindOf(curHeading) ?? 'motion';
      const m = curHeading.match(/(\d+)s/);
      sections.push({ kind, startSeconds: m ? parseInt(m[1], 10) : 0, text: cur.join('\n') });
    }
  };
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && line.startsWith('## ')) {
      flush();
      cur = [line];
      curHeading = line.slice(3).trim();
    } else if (cur) {
      cur.push(line);
    } else {
      head.push(line);
    }
  }
  flush();
  return { head: head.join('\n'), sections };
}

function addDimension(frontmatter: string, kind: SectionKind): string {
  return frontmatter.replace(/^(dimensions:\s*\[)([^\]]*)(\])/m, (_, open, inner, close) => {
    const dims = inner.split(',').map((d: string) => d.trim()).filter(Boolean);
    // Dedupe by kind, not by string — a zh note must not gain a second
    // entry for the same dimension when a section is appended in en.
    if (!dims.some((d: string) => labelToKind(d) === kind)) dims.push(headingLabel(kind));
    const rank = (d: string) => { const k = labelToKind(d); return k ? KINDS.indexOf(k) : -1; };
    dims.sort((a: string, b: string) => rank(a) - rank(b));
    return `${open}${dims.join(', ')}${close}`;
  });
}

function renumber(sections: ParsedSection[]): ParsedSection[] {
  const counters: Partial<Record<SectionKind, number>> = {};
  return sections.map((s) => {
    if (s.kind !== 'motion' && s.kind !== 'screenshot') return s;
    counters[s.kind] = (counters[s.kind] ?? 0) + 1;
    // Labels contain no regex metacharacters (enforced by i18n.test.ts).
    const labels = labelVariants(s.kind).join('|');
    const text = s.text.replace(new RegExp(`^(## .*?(?:${labels}) )\\S+( ·.*)?$`, 'm'), `$1${circledNumber(counters[s.kind]!)}$2`);
    return { ...s, text };
  });
}

export function mergeSection(existing: string, section: NewSection): { content: string; skipped: boolean } {
  const fmMatch = existing.match(/^---\n[\s\S]*?\n---/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;

  const { head, sections } = parseSections(body);

  if (section.kind !== 'motion' && section.kind !== 'screenshot' && sections.some((s) => s.kind === section.kind)) {
    return { content: existing, skipped: true };
  }

  const incoming: ParsedSection = { kind: section.kind, startSeconds: section.startSeconds, text: section.text };
  const all = [...sections, incoming].sort((a, b) =>
    KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.startSeconds - b.startSeconds,
  );
  const ordered = renumber(all);

  const newFrontmatter = addDimension(frontmatter, section.kind);
  const dims = KINDS.filter((k) => ordered.some((s) => s.kind === k));
  const newHead = syncOverview(head, newFrontmatter, dims).replace(/\s+$/, '');
  const renderedSections = ordered.map((s) => stripTrailingRule(emojiHeading(s.text, s.kind))).join('\n\n---\n\n');
  const newBody = [newHead, '', renderedSections, ''].join('\n');
  return { content: `${newFrontmatter}${newBody}`, skipped: false };
}

// Re-export sanitize for use in clip-router.ts via this module (avoids double import)
export { sanitize };
```

- [ ] **Step 4: Localize the fallback link in `src/util.ts`**

Add `import { t } from './i18n';` to the imports, and change line 71 from
`return \`[▶ 跳转原视频](${url})\`;` to:

```typescript
  return `[${t('note.openOriginal')}](${url})`;
```

- [ ] **Step 5: Show the display label in the skip notice (`src/clip-router.ts`)**

Add to the video-note import on line 4: `headingLabel` (the import becomes `import { buildAnchor, mergeSection, coverSection, hookSection, keyframeSection, screenshotSection, VideoNoteMeta, NewSection, headingLabel } from './video-note';`).

Change line 55 from
`` if (skipped) return { notePath: existing.path, notice: `「${section.kind}」已存在，未覆盖。想重做请先删掉该小节再点。` }; ``
to:

```typescript
    if (skipped) return { notePath: existing.path, notice: `「${headingLabel(section.kind)}」已存在，未覆盖。想重做请先删掉该小节再点。` };
```

(The surrounding Chinese text moves to `t()` in Task 3 — this task only fixes what the kind rename breaks: without this, the notice would show the raw id `content`.)

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: ALL suites pass, including the 4 new bilingual tests. If clip-router tests fail on Chinese assertions, the `setLanguage('zh')` beforeEach from Step 1 is missing.

Run: `npx tsc --noEmit` — expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/video-note.ts src/util.ts src/clip-router.ts tests/video-note.test.ts tests/clip-router.test.ts
git commit -m "feat: language-neutral SectionKind with dual-language heading parse, current-language write"
```

---

### Task 3: clip-router.ts remaining strings → t()

**Files:**
- Modify: `src/clip-router.ts` (skip-notice, error messages, screenshot template)
- Test: `tests/clip-router.test.ts` (add English-output tests)

**Interfaces:**
- Consumes: `t()` from `src/i18n.ts`; `sopBlock`, `headingLabel` from `src/video-note.ts`.
- Produces: no new exports; behavior only.

- [ ] **Step 1: Write the failing tests**

In `tests/clip-router.test.ts`, add a standalone describe after the `routeClip — screenshot` block:

```typescript
describe('routeClip — screenshot (English)', () => {
  beforeEach(() => setLanguage('en'));

  test('template note is written in English', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'screenshot',
      images: [Buffer.from('pixels').toString('base64')],
      url: 'https://x.com',
      title: 'My Screenshot',
    };
    await routeClip(payload, clipRules, vaultOps);
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('Source: https://x.com'),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('## Notes'),
    );
  });
});
```

And inside the existing `describe('routeClip — unified video note (manual)', …)` block (so it can reuse `vaultWithStore` and `hookPayload`), add a nested describe:

```typescript
  describe('English output', () => {
    beforeEach(() => setLanguage('en'));

    test('re-capture notice is English and names the section label', async () => {
      const { v } = vaultWithStore();
      await routeClip(hookPayload, manual, v);
      const r = await routeClip(hookPayload, manual, v);
      expect(r.notice).toContain('"Content" already exists');
    });
  });
```

(Jest runs outer `beforeEach` — zh from Task 2 — before the inner one, so `en` wins inside these blocks.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest tests/clip-router.test.ts`
Expected: FAIL — the two new tests (template still Chinese; notice still hardcoded Chinese).

- [ ] **Step 3: Implement**

In `src/clip-router.ts`:

(a) Add the import: `import { t } from './i18n';` and add `sopBlock` to the video-note import list.

(b) Skip notice (line 55) — replace the Task 2 interim version with:

```typescript
    if (skipped) return { notePath: existing.path, notice: t('notice.sectionExists', { section: headingLabel(section.kind) }) };
```

(c) `buildScreenshotTemplate` — replace the whole function body (the inline SOP block duplicates `sopBlock` string-for-string; now that both read the same locale keys, use the export):

```typescript
function buildScreenshotTemplate(payload: ScreenshotPayload, imageNames: string[], sopContent?: string): string {
  const imageLines = imageNames.map((n) => `> ![[${n}]]`).join('\n');
  const parts = [
    `# Screenshot — ${payload.title}`,
    ``,
    t('note.source', { url: payload.url }),
    ``,
    `> [!NOTE] ${t('note.screenshotCallout')}`,
    imageLines,
    ``,
  ];
  if (sopContent) parts.push(sopBlock(sopContent), ``);
  parts.push(`---`, ``, `## ${t('note.notesHeading')}`, ``);
  return parts.join('\n');
}
```

(d) The two thrown errors:

Line 123: `throw new Error(t('error.screenshotFolderNotConfigured'));`
Line 183: `throw new Error(t('error.videoFolderNotConfigured'));`

- [ ] **Step 4: Run the full suite**

Run: `npm test` — expected: all pass (existing zh-pinned suites still green because the zh locale values are byte-identical to the old hardcoded strings).
Run: `npx tsc --noEmit` — expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/clip-router.ts tests/clip-router.test.ts
git commit -m "feat: localize clip-router notices, errors, and screenshot template"
```

---

### Task 4: Language setting + settings UI + main.ts wiring

Per project convention (settings UI / main.ts), no new unit tests beyond a default-value check; implement, verify, commit.

**Expected user-visible behavior (stated per CLAUDE.md requirement):** the settings tab gains a "Language" dropdown at the very top with options English/中文 (default English); picking one immediately re-renders the whole settings page in that language, and all future Notices and generated note text use it.

**Files:**
- Modify: `src/types.ts` (add `language` to `PluginSettings`)
- Modify: `src/settings.ts` (DEFAULT_SETTINGS + dropdown + every label via `t()`)
- Modify: `src/main.ts` (`setLanguage` on load; Notices via `t()`)
- Test: `tests/settings.test.ts` (default language check)

**Interfaces:**
- Consumes: `t`, `setLanguage`, `Language` from `src/i18n.ts`.
- Produces: `PluginSettings.language: Language` (default `'en'`).

- [ ] **Step 1: Add the failing default test**

Append to `tests/settings.test.ts`:

```typescript
test('default language is English', () => {
  expect(DEFAULT_SETTINGS.language).toBe('en');
});
```

Run: `npx jest tests/settings.test.ts` — expected: FAIL (compile error, no `language` field).

- [ ] **Step 2: `src/types.ts`** — add the import at the top and the field:

```typescript
import type { Language } from './i18n';
```

In `PluginSettings`, add as the first field:

```typescript
export interface PluginSettings {
  language: Language;
  httpServer: HttpServerSettings;
  // …rest unchanged
```

- [ ] **Step 3: `src/settings.ts`**

(a) Imports: `import { t, setLanguage, Language } from './i18n';`

(b) `DEFAULT_SETTINGS` — add `language: 'en',` as the first property.

(c) At the top of `display()` (before the 存储位置 heading), add the dropdown. Dropdown option labels stay language-native (`English` / `中文`) — never translated:

```typescript
    new Setting(containerEl)
      .setName(t('settings.language'))
      .addDropdown(d => d
        .addOption('en', 'English')
        .addOption('zh', '中文')
        .setValue(this.plugin.settings.language)
        .onChange(async v => {
          this.plugin.settings.language = v as Language;
          setLanguage(this.plugin.settings.language);
          await this.plugin.saveSettings();
          this.display();
        }));
```

(d) Replace every hardcoded label with its key (same structure, only the string literals change):

| Current literal | Replace with |
|---|---|
| `'存储位置'` | `t('settings.storageHeading')` |
| `'视频笔记文件夹'` / its desc | `t('settings.videoNotesFolder.name')` / `t('settings.videoNotesFolder.desc')` |
| `'封面图片文件夹'` / desc | `t('settings.coverFolder.name')` / `t('settings.coverFolder.desc')` |
| `'帧图片文件夹'` / desc | `t('settings.framesFolder.name')` / `t('settings.framesFolder.desc')` |
| `'截图文件夹'` / desc | `t('settings.screenshotFolder.name')` / `t('settings.screenshotFolder.desc')` |
| `'高级'` | `t('settings.advancedHeading')` |
| `'启用 HTTP 服务'` / desc | `t('settings.httpEnable.name')` / `t('settings.httpEnable.desc')` |
| `'端口'` / desc | `t('settings.port.name')` / `t('settings.port.desc')` |
| `'抽帧数量上限'` / desc | `t('settings.maxFrames.name')` / `t('settings.maxFrames.desc')` |
| `sopModes` labels | `t('settings.sop.thumbnail')`, `t('settings.sop.screenshot')`, `t('settings.sop.hook')`, `t('settings.sop.keyframe')` |
| SOP desc | `t('settings.sop.desc')` |

(`sopModes` is built inside `display()`, so re-render picks up the new language automatically.)

- [ ] **Step 4: `src/main.ts`**

(a) Import: `import { t, setLanguage } from './i18n';`

(b) In `onload()`, immediately after `await this.loadSettings();`:

```typescript
    setLanguage(this.settings.language);
```

(No `loadSettings` change needed: `...loaded` spread preserves a saved `language`, and `DEFAULT_SETTINGS` supplies `'en'` when absent.)

(c) Line 71 → `new Notice(t('notice.savedTo', { folder }), 8000);`

(d) Line 127 → `new Notice(t('notice.portInUse', { port }), 10000);`

- [ ] **Step 5: Verify**

Run: `npm test` — expected: all pass.
Run: `npx tsc --noEmit` — expected: clean.
Run: `npm run build` — expected: builds `main.js` without errors.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/settings.ts src/main.ts tests/settings.test.ts
git commit -m "feat: language setting with en/zh dropdown; settings UI and notices localized"
```

---

### Task 5: Bilingual README

**Files:**
- Modify: `README.md` (English-only; update UI-label references to the new English labels; add Language row; add language switch link; the trailing 中文快速上手 section is superseded by README.zh.md — its content moves there)
- Create: `README.zh.md` (full Chinese translation)

**Interfaces:** none (docs only).

- [ ] **Step 1: Update `README.md`**

(a) Insert as the very first line (above `# Vault Autopilot`):

```markdown
**English** | [简体中文](README.zh.md)
```

(b) In "Settings reference": change `### 存储位置 (Storage locations)` → `### Storage locations`, `### 高级 (Advanced)` → `### Advanced`. Replace the bilingual field names in the tables with the English UI labels: `Video notes folder`, `Cover images folder`, `Frame images folder`, `Screenshots folder`, `Enable HTTP server`, `Port`, `Max frames`, `Cover/Screenshot/Hook/Keyframe SOP path`. Add a new first row to the reference (before the Storage locations table):

```markdown
### Language

The **Language** dropdown at the top of the settings tab switches the plugin between English and 中文 — settings UI, notices, and the text written into generated notes. Default is English. Notes created under one language remain fully recognized after switching: section matching understands both languages, so existing notes never break (headings inside one note may end up mixed, which is cosmetic only).
```

(c) In "Troubleshooting": replace `(高级 → 端口)` with `(Advanced → Port)` (both occurrences) and `启用 HTTP 服务 (enable HTTP server)` with `**Enable HTTP server**`; replace `Check 存储位置 in settings` with `Check **Storage locations** in settings`.

(d) Remove the trailing `## 中文快速上手` section (everything from that heading to end of file) — its content is preserved and expanded in README.zh.md created next step.

- [ ] **Step 2: Create `README.zh.md`**

A full Chinese translation of README.md, same section structure, starting with:

```markdown
[English](README.md) | **简体中文**

# Vault Autopilot
```

Translate every section of the final README.md from Step 1 faithfully (What it does / Install / Quickstart / Folder layout / Settings reference / Network use disclosure / Troubleshooting / License). Use the zh UI labels from `src/locales/zh.json` verbatim wherever a settings field is named (语言、存储位置、视频笔记文件夹、封面图片文件夹、帧图片文件夹、截图文件夹、高级、启用 HTTP 服务、端口、抽帧数量上限、封面/截图/Hook/关键帧 SOP 路径). Incorporate the removed 中文快速上手 content into the Quickstart section. In the Language section, state: 默认英文，在设置页顶部「语言」下拉框切换；切换语言后旧笔记依然能被正确识别与追加（同一条笔记内可能出现中英标题混排，仅影响观感，不影响功能）。

- [ ] **Step 3: Verify links**

Run: `ls README.md README.zh.md` — both exist. Open both and confirm the top cross-links point at each other and that no Chinese UI labels remain in README.md outside the 简体中文 link.

- [ ] **Step 4: Commit**

```bash
git add README.md README.zh.md
git commit -m "docs: split README into English + Chinese with cross-links"
```

---

### Task 6: Final verification

- [ ] **Step 1: Full test suite** — Run `npm test`. Expected: all suites pass (paste the actual `Tests: N passed` line).
- [ ] **Step 2: Type check** — Run `npx tsc --noEmit`. Expected: no output.
- [ ] **Step 3: Production build** — Run `npm run build`. Expected: `main.js` written.
- [ ] **Step 4: Both languages bundled** — Run:

```bash
grep -c "Storage locations" main.js && grep -c "存储位置" main.js
```

Expected: both counts ≥ 1 (confirms both locales are inside the single distributed file).

- [ ] **Step 5: Report** — paste the test summary, tsc result, and grep counts. No commit (main.js is gitignored; Task 5 was the last content commit).
