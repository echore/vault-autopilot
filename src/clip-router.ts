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
