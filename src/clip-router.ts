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

function sampleFrames(frames: string[], max: number): string[] {
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  return Array.from({ length: max }, (_, i) => frames[Math.floor(i * step)]);
}

function buildTimestampUrl(url: string, platform: string | undefined, startSeconds: number): string {
  const sep = url.includes('?') ? '&' : '?';
  if (platform === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    return `${url}${sep}t=${startSeconds}s`;
  }
  if (platform === 'bilibili' || url.includes('bilibili.com')) {
    return `${url}${sep}t=${startSeconds}`;
  }
  return url;
}

function buildManualTemplate(
  payload: HookPayload | KeyframePayload,
  frameNames: string[],
): string {
  const embeds = frameNames.map((n) => `![[${n}]]`).join('\n');
  const startSeconds = payload.mode === 'keyframe' ? payload.time_range.start : 0;
  const platform = payload.mode === 'hook' ? payload.platform : undefined;
  const channel = payload.mode === 'hook' ? payload.channel : undefined;
  const jumpUrl = buildTimestampUrl(payload.url, platform, startSeconds);

  if (payload.mode === 'hook') {
    const transcriptSection = payload.transcript
      ? `\n**字幕**\n${payload.transcript}\n`
      : '';
    return [
      `# Hook — ${payload.video_title}`,
      ``,
      `▶ [跳转原视频](${jumpUrl})`,
      `来源：${platform ?? ''} | ${channel ?? ''} | ${payload.url} | ${payload.captured_at}`,
      ``,
      embeds,
      transcriptSection,
      `---`,
      ``,
      `## Hook 类型`,
      ``,
      `## 具体手法`,
      ``,
      `## 为什么有效`,
      ``,
      `## 如何复制`,
      ``,
      `## 我的想法`,
      ``,
    ].join('\n');
  } else {
    const { start, end } = payload.time_range;
    return [
      `# 关键帧 — ${payload.video_title} [${start}s–${end}s]`,
      ``,
      `▶ [跳转原视频 (${start}s–${end}s)](${jumpUrl})`,
      `来源：${payload.url} | ${payload.captured_at}`,
      ``,
      embeds,
      ``,
      `---`,
      ``,
      `## 技法类型`,
      ``,
      `## 技术实现`,
      ``,
      `## 视觉目的`,
      ``,
      `## 如何复制`,
      ``,
      `## 我的想法`,
      ``,
    ].join('\n');
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
    await vaultOps.ensureFolder(rule.outputFolder);
    const frameNames: string[] = [];
    for (let i = 0; i < sampled.length; i++) {
      const name = `${stem}-f${String(i + 1).padStart(2, '0')}.png`;
      const bytes = Buffer.from(sampled[i], 'base64');
      await vaultOps.createBinary(`${rule.outputFolder}/${name}`, bytes.buffer as ArrayBuffer);
      frameNames.push(name);
    }
    const template = buildManualTemplate(payload, frameNames);
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
