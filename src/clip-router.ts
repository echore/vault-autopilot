import { ClipPayload, HookPayload, KeyframePayload, LegacyClipPayload, ScreenshotPayload, ThumbnailPayload } from './server';
import { AIProvider, ClipRule, isMultiFrameProvider, MultiFrameRequest, PluginSettings, ScreenshotClipRule, ThumbnailClipRule, WatchRule } from './types';
import { postProcessMarkdown, sanitize, buildVideoEmbed, extractVideoId } from './util';

export interface VaultOps {
  ensureFolder(folderPath: string): Promise<void>;
  createBinary(filePath: string, data: ArrayBuffer): Promise<void>;
  create(filePath: string, content: string): Promise<void>;
  readFileSync(absolutePath: string): string;
  downloadUrl(url: string): Promise<ArrayBuffer>;
  listMarkdownFiles(folderPath: string): string[];
  read(filePath: string): Promise<string>;
  modify(filePath: string, content: string): Promise<void>;
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
  if (payload.mode === 'thumbnail') return handleThumbnail(payload, providers, clipRules.thumbnail, vaultOps);
  if (payload.mode === 'screenshot') {
    const normalized = normalizeScreenshot(payload);
    return handleScreenshot(normalized, providers, clipRules.screenshot, vaultOps);
  }
  if (payload.mode === 'hook') return handleMultiFrame(payload, providers, clipRules.hook, vaultOps, clipRules.thumbnail.outputFolder);
  if (payload.mode === 'keyframe') return handleMultiFrame(payload, providers, clipRules.keyframe, vaultOps, clipRules.thumbnail.outputFolder);
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

function thumbnailNoteStem(payload: ThumbnailPayload): string {
  const titleSlug = payload.title.slice(0, 40).trim();
  return `${payload.channel} - ${titleSlug}`;
}

function buildThumbnailNote(payload: ThumbnailPayload, thumbnailFile: string, sopContent?: string, coverAnalysis?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const frontmatter = [
    `---`,
    `type: video`,
    `platform: ${payload.platform}`,
    `channel: "${payload.channel}"`,
    ...(payload.channel_handle ? [`channel_handle: "${payload.channel_handle}"`] : []),
    `video_id: "${payload.video_id}"`,
    `video_url: "${payload.video_url}"`,
    `title: "${payload.title}"`,
    ...(payload.views ? [`views: "${payload.views}"`] : []),
    `analyzed_at: ${today}`,
    `tags: []`,
    `dimensions: [封面标题]`,
    `depth: normal`,
    `---`,
  ].join('\n');

  const bodyParts = [
    ``,
    `# ${payload.title}`,
    ``,
    `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${payload.video_id}" frameborder="0" allowfullscreen></iframe>`,
    ``,
    `![[${thumbnailFile}]]`,
    ``,
  ];
  if (sopContent) bodyParts.push(sopBlock(sopContent), ``);
  bodyParts.push(`## 封面标题`, ``, coverAnalysis ?? ``);

  return frontmatter + bodyParts.join('\n');
}

async function handleThumbnail(
  payload: ThumbnailPayload,
  providers: Map<string, AIProvider>,
  rule: ThumbnailClipRule,
  vaultOps: VaultOps,
): Promise<void> {
  if (!rule.outputFolder || !rule.thumbnailFolder) {
    throw new Error('Thumbnail output folder or thumbnail folder is not configured. Go to Settings → Clip Rules → Thumbnail.');
  }
  await vaultOps.ensureFolder(rule.thumbnailFolder);
  await vaultOps.ensureFolder(rule.outputFolder);

  const thumbnailFile = `${payload.video_id}.webp`;
  const thumbnailPath = `${rule.thumbnailFolder}/${thumbnailFile}`;
  const imgData = await vaultOps.downloadUrl(payload.thumbnail_url);
  await vaultOps.createBinary(thumbnailPath, imgData);

  const stem = thumbnailNoteStem(payload);
  const notePath = `${rule.outputFolder}/${stem}.md`;

  if (rule.processingMode === 'manual') {
    const sopContent = readSopSafely(rule.sopPath, vaultOps);
    await vaultOps.create(notePath, buildThumbnailNote(payload, thumbnailFile, sopContent));
    return;
  }

  if (!rule.sopPath || !rule.providerId) {
    throw new Error('Thumbnail clip rule is not fully configured (sopPath / providerId missing)');
  }
  const provider = providers.get(rule.providerId);
  if (!provider) throw new Error(`Provider "${rule.providerId}" not found`);
  if (!isMultiFrameProvider(provider)) {
    throw new Error(
      `Provider "${provider.name}" does not support image analysis. ` +
      `Use an API provider (Anthropic, OpenAI-compatible, or Gemini).`,
    );
  }
  const sopContent = vaultOps.readFileSync(rule.sopPath);
  const result = await provider.analyzeMultiFrame({
    frames: [Buffer.from(imgData)],
    sopContent,
    meta: { video_title: payload.title, channel: payload.channel, url: payload.video_url },
  });
  await vaultOps.create(notePath, buildThumbnailNote(payload, thumbnailFile, postProcessMarkdown(result)));
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
  if (!rule.outputFolder) {
    throw new Error('Screenshot output folder is not configured. Go to Settings → Clip Rules → Screenshot → Output folder.');
  }
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

async function findNoteByVideoId(
  videoId: string,
  folder: string,
  vaultOps: VaultOps,
): Promise<{ path: string; content: string } | null> {
  const files = vaultOps.listMarkdownFiles(folder);
  for (const filePath of files) {
    const content = await vaultOps.read(filePath);
    if (content.includes(`video_id: "${videoId}"`)) return { path: filePath, content };
  }
  return null;
}

function addDimension(content: string, dimension: string): string {
  return content.replace(
    /^(dimensions:\s*\[)([^\]]*)(\])/m,
    (_, open, inner, close) => {
      const dims = inner.split(',').map((d: string) => d.trim()).filter(Boolean);
      if (!dims.includes(dimension)) dims.push(dimension);
      return `${open}${dims.join(', ')}${close}`;
    },
  );
}

function buildAppendSection(
  payload: HookPayload | KeyframePayload,
  frameNames: string[],
  sopContent?: string,
  aiResult?: string,
): string {
  const header = payload.mode === 'hook' ? `## 内容` : `## 动效`;
  if (aiResult) return `\n${header}\n\n${aiResult}\n`;

  const frameLines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join('\n');
  const frameChecklist = [`> `, `> - [ ] 按 SOP 完成分析，填入各章节`].join('\n');
  const parts = [``, header, ``, `> [!NOTE] 分析用帧`, frameLines, frameChecklist, ``];
  if (sopContent) parts.push(sopBlock(sopContent), ``);
  if (payload.mode === 'hook' && payload.transcript) {
    parts.push(`## 字幕`, ``, payload.transcript, ``);
  }
  return parts.join('\n');
}

async function handleMultiFrame(
  payload: HookPayload | KeyframePayload,
  providers: Map<string, AIProvider>,
  rule: ClipRule,
  vaultOps: VaultOps,
  searchFolder: string,
): Promise<void> {
  // ── Save frames (both modes need them for manual; auto uses them for AI) ──────
  const max = rule.maxFrames ?? 5;
  const sampled = sampleFrames(payload.frames, max);
  const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;

  // ── Check for existing Great Videos note to append to ────────────────────────
  const videoId = extractVideoId(payload.url, payload.mode === 'hook' ? payload.platform : undefined);
  const existing = videoId && searchFolder
    ? await findNoteByVideoId(videoId, searchFolder, vaultOps)
    : null;

  if (rule.processingMode === 'manual') {
    const framesDir = rule.framesFolder || rule.outputFolder;
    await vaultOps.ensureFolder(framesDir);
    const frameNames: string[] = [];
    for (let i = 0; i < sampled.length; i++) {
      const name = `${stem}-f${String(i + 1).padStart(2, '0')}.png`;
      const bytes = Buffer.from(sampled[i], 'base64');
      await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer as ArrayBuffer);
      frameNames.push(name);
    }
    const sopContent = readSopSafely(rule.sopPath, vaultOps);
    if (existing) {
      const dimension = payload.mode === 'hook' ? '内容' : '动效';
      const updated = addDimension(existing.content, dimension) + buildAppendSection(payload, frameNames, sopContent);
      await vaultOps.modify(existing.path, updated);
      return;
    }
    await vaultOps.ensureFolder(rule.outputFolder);
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
  const frames = sampled.map((f) => Buffer.from(f, 'base64'));
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
  const aiResult = postProcessMarkdown(result);
  if (existing) {
    const dimension = payload.mode === 'hook' ? '内容' : '动效';
    const updated = addDimension(existing.content, dimension) + buildAppendSection(payload, [], undefined, aiResult);
    await vaultOps.modify(existing.path, updated);
    return;
  }
  await vaultOps.ensureFolder(rule.outputFolder);
  await vaultOps.create(`${rule.outputFolder}/${stem}.md`, aiResult);
}
