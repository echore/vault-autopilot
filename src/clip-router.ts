import { ClipPayload, HookPayload, KeyframePayload, LegacyClipPayload, ScreenshotPayload, ThumbnailPayload } from './server';
import { AIProvider, ClipRule, isMultiFrameProvider, MultiFrameRequest, PluginSettings, ScreenshotClipRule, ThumbnailClipRule, WatchRule } from './types';
import { postProcessMarkdown, sanitize, buildVideoEmbed, extractVideoId, detectPlatform } from './util';
import { buildAnchor, mergeSection, coverSection, hookSection, keyframeSection, VideoNoteMeta, NewSection } from './video-note';

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
): Promise<{ notePath?: string; notice?: string }> {
  if (isLegacy(payload)) {
    await handleLegacyScreenshot(payload, watchRules, vaultOps);
    return {};
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
): Promise<undefined> {
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

function readSopSafely(sopPath: string, vaultOps: VaultOps): string | undefined {
  if (!sopPath) return undefined;
  try { return vaultOps.readFileSync(sopPath); } catch { return undefined; }
}

async function upsertVideoNote(
  meta: VideoNoteMeta,
  section: NewSection,
  vaultOps: VaultOps,
  folder: string,
): Promise<{ notePath: string; notice?: string }> {
  await vaultOps.ensureFolder(folder);
  const existing = meta.videoId ? await findNoteByVideoId(meta.videoId, folder, vaultOps) : null;
  if (existing) {
    const { content, skipped } = mergeSection(existing.content, section);
    if (skipped) return { notePath: existing.path, notice: `「${section.kind}」已存在，未覆盖。想重做请先删掉该小节再点。` };
    await vaultOps.modify(existing.path, content);
    return { notePath: existing.path };
  }
  const { content } = mergeSection(buildAnchor(meta), section);
  const stem = meta.channel ? `${sanitize(meta.channel)} - ${sanitize(meta.title)}` : sanitize(meta.title);
  const notePath = `${folder}/${stem || 'video'}.md`;
  await vaultOps.create(notePath, content);
  return { notePath };
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
  // sopBlock is now in video-note; inline the template here for screenshots
  if (sopContent) {
    const lines = sopContent.split('\n').map((l) => `> ${l}`).join('\n');
    const checklist = [`> `, `> ---`, `> **完成后执行：**`, `> - [ ] 分析已写入笔记各章节`, `> - [ ] 删除此整个提示块`].join('\n');
    parts.push(`> [!TIP] 分析提示\n${lines}\n${checklist}`, ``);
  }
  parts.push(`---`, ``, `## 笔记`, ``);
  return parts.join('\n');
}

async function handleScreenshot(
  payload: ScreenshotPayload,
  providers: Map<string, AIProvider>,
  rule: ScreenshotClipRule,
  vaultOps: VaultOps,
): Promise<{ notePath: string }> {
  if (!rule.outputFolder) {
    throw new Error('Screenshot output folder is not configured. Go to Settings → Clip Rules → Screenshot → Output folder.');
  }
  const stem = `screenshot-${sanitize(payload.title)}-${Date.now()}`;
  const notePath = `${rule.outputFolder}/${stem}.md`;
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
    await vaultOps.create(notePath, template);
    return { notePath };
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
  await vaultOps.create(notePath, markdown);
  return { notePath };
}

function sampleFrames(frames: string[], max: number): string[] {
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  return Array.from({ length: max }, (_, i) => frames[Math.floor(i * step)]);
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

async function handleThumbnail(
  payload: ThumbnailPayload,
  providers: Map<string, AIProvider>,
  rule: ThumbnailClipRule,
  vaultOps: VaultOps,
): Promise<{ notePath: string; notice?: string }> {
  if (!rule.outputFolder || !rule.thumbnailFolder) {
    throw new Error('Thumbnail output folder or thumbnail folder is not configured. Go to Settings → Clip Rules → Thumbnail.');
  }
  await vaultOps.ensureFolder(rule.thumbnailFolder);

  const urlExt = payload.thumbnail_url.split('?')[0].match(/\.(\w+)$/)?.[1] ?? 'webp';
  const thumbnailFile = `${payload.video_id}.${urlExt}`;
  const thumbnailPath = `${rule.thumbnailFolder}/${thumbnailFile}`;
  const imgData = await vaultOps.downloadUrl(payload.thumbnail_url);
  await vaultOps.createBinary(thumbnailPath, imgData);

  const sopContent = rule.processingMode === 'manual'
    ? readSopSafely(rule.sopPath, vaultOps)
    : undefined;
  let aiResult: string | undefined;
  if (rule.processingMode !== 'manual') {
    if (!rule.sopPath || !rule.providerId) throw new Error('Thumbnail clip rule is not fully configured (sopPath / providerId missing)');
    const provider = providers.get(rule.providerId);
    if (!provider) throw new Error(`Provider "${rule.providerId}" not found`);
    if (!isMultiFrameProvider(provider)) throw new Error(`Provider "${provider.name}" does not support image analysis. Use an API provider.`);
    const sop = vaultOps.readFileSync(rule.sopPath);
    aiResult = postProcessMarkdown(await provider.analyzeMultiFrame({ frames: [Buffer.from(imgData)], sopContent: sop, meta: { video_title: payload.title, channel: payload.channel, url: payload.video_url } }));
  }
  const section = coverSection(thumbnailFile, aiResult ?? sopContent);
  const meta: VideoNoteMeta = {
    platform: payload.platform,
    videoId: extractVideoId(payload.video_url, payload.platform) ?? payload.video_id,
    videoUrl: payload.video_url,
    title: payload.title,
    channel: payload.channel,
  };
  return upsertVideoNote(meta, section, vaultOps, rule.outputFolder);
}

async function handleMultiFrame(
  payload: HookPayload | KeyframePayload,
  providers: Map<string, AIProvider>,
  rule: ClipRule,
  vaultOps: VaultOps,
  searchFolder: string,
): Promise<{ notePath: string; notice?: string }> {
  // ── Save frames (both modes need them for manual; auto uses them for AI) ──────
  const max = rule.maxFrames ?? 5;
  const sampled = sampleFrames(payload.frames, max);
  const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;

  const platform = detectPlatform(payload.url);
  const videoId = extractVideoId(payload.url, platform);
  const meta: VideoNoteMeta = {
    platform,
    videoId: videoId ?? '',
    videoUrl: payload.url,
    title: payload.video_title,
    channel: payload.mode === 'hook' ? payload.channel : undefined,
  };

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
    let section: NewSection;
    if (payload.mode === 'hook') {
      section = hookSection(
        { url: payload.url, platform, endSeconds: payload.time_range?.end ?? 15, frameNames, transcript: payload.transcript, aiResult: undefined },
        sopContent,
      );
    } else {
      section = keyframeSection(
        { url: payload.url, platform, start: payload.time_range.start, end: payload.time_range.end, frameNames, aiResult: undefined },
        sopContent,
      );
    }
    return upsertVideoNote(meta, section, vaultOps, searchFolder);
  }

  if (!rule.sopPath || !rule.outputFolder || !rule.providerId) {
    throw new Error(`Clip rule for "${payload.mode}" is not configured`);
  }
  const provider = providers.get(rule.providerId);
  if (!provider) throw new Error(`Provider "${rule.providerId}" not found`);
  if (!isMultiFrameProvider(provider)) {
    throw new Error(
      `Provider "${payload.mode === 'hook' ? 'hook' : rule.providerId}" does not support multi-frame analysis. ` +
      `Use an API provider (Anthropic, OpenAI-compatible, or Gemini).`,
    );
  }
  const frames = sampled.map((f) => Buffer.from(f, 'base64'));
  const sopContent = vaultOps.readFileSync(rule.sopPath);
  const metaReq: MultiFrameRequest['meta'] = {
    video_title: payload.video_title,
    url: payload.url,
    captured_at: payload.captured_at,
    ...(payload.mode === 'hook'
      ? { channel: payload.channel, platform: payload.platform }
      : { time_range: payload.time_range }),
  };
  const transcript = payload.mode === 'hook' ? payload.transcript : undefined;
  const result = await provider.analyzeMultiFrame({ frames, transcript, sopContent, meta: metaReq });
  const aiResult = postProcessMarkdown(result);

  let section: NewSection;
  if (payload.mode === 'hook') {
    section = hookSection(
      { url: payload.url, platform: payload.platform, endSeconds: payload.time_range?.end ?? 15, frameNames: [], transcript: payload.transcript, aiResult },
      sopContent,
    );
  } else {
    section = keyframeSection(
      { url: payload.url, platform: 'youtube', start: payload.time_range.start, end: payload.time_range.end, frameNames: [], aiResult },
      sopContent,
    );
  }
  return upsertVideoNote(meta, section, vaultOps, searchFolder);
}
