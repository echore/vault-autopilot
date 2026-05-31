import { ClipPayload, HookPayload, KeyframePayload, LegacyClipPayload, ScreenshotPayload } from './server';
import { AIProvider, ClipRule, isMultiFrameProvider, MultiFrameRequest, PluginSettings, ScreenshotClipRule, WatchRule } from './types';
import { postProcessMarkdown, sanitize, buildVideoEmbed } from './util';

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
    return handleLegacyScreenshot(payload, watchRules, vaultOps);
  }
  if (payload.mode === 'screenshot') {
    const normalized = normalizeScreenshot(payload);
    return handleScreenshot(normalized, providers, clipRules.screenshot, vaultOps);
  }
  if (payload.mode === 'hook') return handleMultiFrame(payload, providers, clipRules.hook, vaultOps);
  if (payload.mode === 'keyframe') return handleMultiFrame(payload, providers, clipRules.keyframe, vaultOps);
  throw new Error('Unknown clip mode');
}

function isLegacy(p: ClipPayload): p is LegacyClipPayload {
  return 'image_base64' in p;
}

function normalizeScreenshot(payload: ScreenshotPayload & { image?: string }): ScreenshotPayload {
  if (!payload.images && payload.image) {
    return { ...payload, images: [payload.image] };
  }
  return payload;
}

async function handleLegacyScreenshot(
  payload: LegacyClipPayload,
  watchRules: WatchRule[],
  vaultOps: VaultOps,
): Promise<void> {
  const rule = watchRules.find((r) => r.enabled);
  if (!rule) throw new Error('No enabled watch rules configured');
  const stem = `${Date.now()}-${sanitize(payload.title)}`;
  await vaultOps.ensureFolder(rule.watchFolder);
  await vaultOps.create(
    `${rule.watchFolder}/${stem}.meta.json`,
    JSON.stringify({ source_url: payload.source_url, title: payload.title }),
  );
  const bytes = Buffer.from(payload.image_base64, 'base64');
  await vaultOps.createBinary(`${rule.watchFolder}/${stem}.png`, bytes.buffer as ArrayBuffer);
}

function sopBlock(sopContent: string): string {
  const lines = sopContent.split('\n').map((l) => `> ${l}`).join('\n');
  const checklist = [
    `> `,
    `> ---`,
    `> **完成后执行：**`,
    `> - [ ] 分析已写入笔记各章节`,
    `> - [ ] 删除此整个提示块`,
  ].join('\n');
  return `> [!TIP] 分析提示\n${lines}\n${checklist}`;
}

function readSopSafely(sopPath: string, vaultOps: VaultOps): string | undefined {
  if (!sopPath) return undefined;
  try { return vaultOps.readFileSync(sopPath); } catch { return undefined; }
}

function buildScreenshotTemplate(payload: ScreenshotPayload, imageNames: string[], sopContent?: string): string {
  const imageLines = imageNames.map((n) => `> ![[${n}]]`).join('\n');
  const parts = [
    `# Screenshot — ${payload.title}`,
    ``,
    `来源：${payload.url}`,
    ``,
    `> [!NOTE] 截图`,
    imageLines,
    ``,
  ];
  if (sopContent) parts.push(sopBlock(sopContent), ``);
  parts.push(`---`, ``, `## 笔记`, ``);
  return parts.join('\n');
}

async function handleScreenshot(
  payload: ScreenshotPayload,
  providers: Map<string, AIProvider>,
  rule: ScreenshotClipRule,
  vaultOps: VaultOps,
): Promise<void> {
  const stem = `screenshot-${sanitize(payload.title)}-${Date.now()}`;
  const framesDir = rule.framesFolder || rule.outputFolder;
  await vaultOps.ensureFolder(framesDir);
  await vaultOps.ensureFolder(rule.outputFolder);

  const imageNames: string[] = [];
  for (let i = 0; i < payload.images.length; i++) {
    const name = `${stem}-${String(i + 1).padStart(2, '0')}.png`;
    const bytes = Buffer.from(payload.images[i], 'base64');
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer as ArrayBuffer);
    imageNames.push(name);
  }

  if (rule.processingMode === 'manual') {
    const sopContent = readSopSafely(rule.sopPath, vaultOps);
    const template = buildScreenshotTemplate(payload, imageNames, sopContent);
    await vaultOps.create(`${rule.outputFolder}/${stem}.md`, template);
    return;
  }

  if (!rule.sopPath || !rule.outputFolder || !rule.providerId) {
    throw new Error('Screenshot clip rule is not configured');
  }
  const provider = providers.get(rule.providerId);
  if (!provider) throw new Error(`Provider "${rule.providerId}" not found`);
  if (!isMultiFrameProvider(provider)) {
    throw new Error(
      `Provider "${provider.name}" does not support multi-frame analysis. ` +
      `Use an API provider (Anthropic, OpenAI-compatible, or Gemini).`,
    );
  }
  const frames = payload.images.map((img) => Buffer.from(img, 'base64'));
  const sopContent = vaultOps.readFileSync(rule.sopPath);
  const result = await provider.analyzeMultiFrame({
    frames,
    sopContent,
    meta: { url: payload.url },
  });
  const markdown = postProcessMarkdown(result);
  await vaultOps.create(`${rule.outputFolder}/${stem}.md`, markdown);
}

function sampleFrames(frames: string[], max: number): string[] {
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  return Array.from({ length: max }, (_, i) => frames[Math.floor(i * step)]);
}

function buildManualTemplate(
  payload: HookPayload | KeyframePayload,
  frameNames: string[],
  sopContent?: string,
): string {
  const startSeconds = payload.mode === 'keyframe' ? payload.time_range.start : 0;
  const platform = payload.mode === 'hook' ? payload.platform : undefined;
  const channel = payload.mode === 'hook' ? payload.channel : undefined;

  const embed = buildVideoEmbed(payload.url, platform, startSeconds);
  const frameLines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join('\n');
  const frameChecklist = [`> `, `> - [ ] 按 SOP 完成分析，填入各章节`].join('\n');

  if (payload.mode === 'hook') {
    const transcriptSection = payload.transcript
      ? `\n## 字幕\n\n${payload.transcript}\n`
      : '';
    const durationSuffix = payload.time_range ? ` [${payload.time_range.start}s–${payload.time_range.end}s]` : '';
    const durationLabel = payload.time_range ? ` | ${payload.time_range.end}s Hook` : '';
    const parts = [
      `# Hook — ${payload.video_title}${durationSuffix}`,
      ``,
      embed,
      ``,
      `来源：${platform ?? ''} | ${channel ?? ''} | ${payload.url} | ${payload.captured_at}${durationLabel}`,
      ``,
      `> [!NOTE] 分析用帧`,
      frameLines,
      frameChecklist,
      ``,
    ];
    if (sopContent) parts.push(sopBlock(sopContent), ``);
    parts.push(`---`, ``);
    if (transcriptSection) parts.push(transcriptSection);
    parts.push(
      `## Hook 类型`, ``,
      `## 具体手法`, ``,
      `## 为什么有效`, ``,
      `## 如何复制`, ``,
      `## 我的想法`, ``,
    );
    return parts.join('\n');
  } else {
    const { start, end } = payload.time_range;
    const parts = [
      `# 关键帧 — ${payload.video_title} [${start}s–${end}s]`,
      ``,
      embed,
      ``,
      `来源：${payload.url} | ${payload.captured_at} | ${start}s–${end}s`,
      ``,
      `> [!NOTE] 分析用帧`,
      frameLines,
      frameChecklist,
      ``,
    ];
    if (sopContent) parts.push(sopBlock(sopContent), ``);
    parts.push(
      `---`, ``,
      `## 技法类型`, ``,
      `## 技术实现`, ``,
      `## 视觉目的`, ``,
      `## 如何复制`, ``,
      `## 我的想法`, ``,
    );
    return parts.join('\n');
  }
}

async function handleMultiFrame(
  payload: HookPayload | KeyframePayload,
  providers: Map<string, AIProvider>,
  rule: ClipRule,
  vaultOps: VaultOps,
): Promise<void> {
  if (rule.processingMode === 'manual') {
    const max = rule.maxFrames ?? 5;
    const sampled = sampleFrames(payload.frames, max);
    const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;
    const framesDir = rule.framesFolder || rule.outputFolder;
    await vaultOps.ensureFolder(framesDir);
    await vaultOps.ensureFolder(rule.outputFolder);
    const frameNames: string[] = [];
    for (let i = 0; i < sampled.length; i++) {
      const name = `${stem}-f${String(i + 1).padStart(2, '0')}.png`;
      const bytes = Buffer.from(sampled[i], 'base64');
      await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer as ArrayBuffer);
      frameNames.push(name);
    }
    const sopContent = readSopSafely(rule.sopPath, vaultOps);
    const template = buildManualTemplate(payload, frameNames, sopContent);
    await vaultOps.create(`${rule.outputFolder}/${stem}.md`, template);
    return;
  }

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
