import { ClipPayload, HookPayload, KeyframePayload, ScreenshotPayload, ThumbnailPayload } from './server';
import { ClipRule, PluginSettings, ScreenshotClipRule, ThumbnailClipRule } from './types';
import { sanitize, buildVideoEmbed, extractVideoId, detectPlatform, videoKey, safeFileId } from './util';
import { buildAnchor, ensurePublished, mergeSection, coverSection, hookSection, keyframeSection, screenshotSection, VideoNoteMeta, NewSection, headingLabel, sopBlock } from './video-note';
import { t } from './i18n';

export interface VaultOps {
  ensureFolder(folderPath: string): Promise<void>;
  createBinary(filePath: string, data: ArrayBuffer): Promise<void>;
  create(filePath: string, content: string): Promise<void>;
  readFileSync(absolutePath: string): string;
  downloadUrl(url: string): Promise<ArrayBuffer>;
  fileExists(filePath: string): boolean;
  listMarkdownFiles(folderPath: string): string[];
  read(filePath: string): Promise<string>;
  modify(filePath: string, content: string): Promise<void>;
  // Parsed frontmatter from Obsidian's metadataCache; null when not indexed yet.
  getFrontmatter(filePath: string): Record<string, unknown> | null;
}

export async function routeClip(
  payload: ClipPayload,
  clipRules: PluginSettings['clipRules'],
  vaultOps: VaultOps,
  builtinSops: Partial<Record<ClipPayload['mode'], string>> = {},
): Promise<{ notePath?: string; notice?: string }> {
  if (payload.mode === 'thumbnail') return handleThumbnail(payload, clipRules.thumbnail, vaultOps, builtinSops.thumbnail);
  if (payload.mode === 'screenshot') {
    const normalized = normalizeScreenshot(payload);
    return handleScreenshot(normalized, clipRules.screenshot, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.screenshot);
  }
  if (payload.mode === 'hook') return handleMultiFrame(payload, clipRules.hook, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.hook);
  if (payload.mode === 'keyframe') return handleMultiFrame(payload, clipRules.keyframe, vaultOps, clipRules.thumbnail.outputFolder, clipRules.thumbnail.thumbnailFolder, builtinSops.keyframe);
  throw new Error('Unknown clip mode');
}

function normalizeScreenshot(payload: ScreenshotPayload & { image?: string }): ScreenshotPayload {
  if (!payload.images && payload.image) {
    return { ...payload, images: [payload.image] };
  }
  return payload;
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
    if (skipped) {
      const patched = ensurePublished(existing.content, meta.published);
      if (patched !== existing.content) await vaultOps.modify(existing.path, patched);
      return { notePath: existing.path, notice: t('notice.sectionExists', { section: headingLabel(section.kind) }) };
    }
    await vaultOps.modify(existing.path, ensurePublished(content, meta.published));
    return { notePath: existing.path };
  }
  const { content } = mergeSection(buildAnchor(meta), section);
  let stem = (meta.channel ? `${sanitize(meta.channel)} - ${sanitize(meta.title)}` : sanitize(meta.title)) || 'video';
  // Different videos that share author + (truncated) title would collide on the
  // filename; disambiguate with a short fingerprint so the second one is unique.
  if (vaultOps.listMarkdownFiles(folder).includes(`${folder}/${stem}.md`)) {
    stem = `${stem} · ${fileFingerprint(meta.videoId)}`;
  }
  const notePath = `${folder}/${stem}.md`;
  await vaultOps.create(notePath, content);
  return { notePath };
}

function fileFingerprint(videoId: string): string {
  // Clean platform ids (YouTube/Bilibili/Xiaohongshu) are already short & safe.
  if (/^[A-Za-z0-9_-]{1,24}$/.test(videoId)) return videoId;
  // URL-based keys: a short stable hash.
  let h = 0;
  for (let i = 0; i < videoId.length; i++) h = (h * 31 + videoId.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

// Ensure the video's cover exists at `<assetFolder>/<videoId>.webp` — the exact
// path the Great Videos gallery index reads — so every note shows a cover even
// without an explicit 收藏封面. Only clean platform ids map to a valid filename;
// best-effort, a missing cover never fails the clip.
async function ensureCover(videoId: string, coverUrl: string | undefined, vaultOps: VaultOps, assetFolder: string): Promise<void> {
  if (!coverUrl || !/^[A-Za-z0-9_-]{1,24}$/.test(videoId)) return;
  const path = `${assetFolder}/${videoId}.webp`;
  if (vaultOps.fileExists(path)) return;
  try {
    await vaultOps.ensureFolder(assetFolder);
    await vaultOps.createBinary(path, await vaultOps.downloadUrl(coverUrl));
  } catch (_) { /* best-effort */ }
}

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

async function handleScreenshot(
  payload: ScreenshotPayload,
  rule: ScreenshotClipRule,
  vaultOps: VaultOps,
  searchFolder: string,
  assetFolder: string,
  builtinSop?: string,
): Promise<{ notePath: string }> {
  if (!rule.outputFolder) {
    throw new Error(t('error.screenshotFolderNotConfigured'));
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
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    imageNames.push(name);
  }

  // Fold the screenshot into this page's video/post note when the page is a
  // recognized video/post (anchor created if needed, so order doesn't matter) or
  // already has a note; a plain-webpage screenshot stays standalone.
  const key = videoKey(payload.url);
  const existing = await findNoteByVideoId(key, searchFolder, vaultOps);
  const intoVideoNote = !!existing || extractVideoId(payload.url, undefined) != null;
  const meta: VideoNoteMeta = { platform: detectPlatform(payload.url), videoId: key, videoUrl: payload.url, title: payload.title };

  const sopContent = readSopSafely(rule.sopPath, vaultOps) ?? builtinSop;
  if (intoVideoNote) {
    const r = await upsertVideoNote(meta, screenshotSection(imageNames, sopContent), vaultOps, searchFolder);
    await ensureCover(meta.videoId, payload.cover_url, vaultOps, assetFolder);
    return r;
  }
  const template = buildScreenshotTemplate(payload, imageNames, sopContent);
  await vaultOps.create(notePath, template);
  return { notePath };
}

function sampleFrames(frames: string[], max: number): string[] {
  if (frames.length <= max) return frames;
  const step = frames.length / max;
  return Array.from({ length: max }, (_, i) => frames[Math.floor(i * step)]);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findNoteByVideoId(
  videoId: string,
  folder: string,
  vaultOps: VaultOps,
): Promise<{ path: string; content: string } | null> {
  const files = vaultOps.listMarkdownFiles(folder);
  // Obsidian's Properties editor re-serializes frontmatter and drops quotes, so
  // an exact-substring match on `video_id: "x"` orphans the note forever. The
  // metadataCache compares parsed values (quote-agnostic) without reading file
  // contents; files the cache hasn't indexed yet (just-created notes) fall back
  // to a quote-tolerant scan.
  const pattern = new RegExp(`^video_id:\\s*"?${escapeRegExp(videoId)}"?\\s*$`, 'm');
  for (const filePath of files) {
    const fm = vaultOps.getFrontmatter(filePath);
    if (fm) {
      if (String(fm.video_id ?? '') === videoId) return { path: filePath, content: await vaultOps.read(filePath) };
      continue;
    }
    const content = await vaultOps.read(filePath);
    if (pattern.test(content)) return { path: filePath, content };
  }
  return null;
}

async function handleThumbnail(
  payload: ThumbnailPayload,
  rule: ThumbnailClipRule,
  vaultOps: VaultOps,
  builtinSop?: string,
): Promise<{ notePath: string; notice?: string }> {
  if (!rule.outputFolder || !rule.thumbnailFolder) {
    throw new Error(t('error.videoFolderNotConfigured'));
  }
  await vaultOps.ensureFolder(rule.thumbnailFolder);

  // Always .webp — the gallery index reads `<video_id>.webp` exactly. (The bytes
  // are jpg/png; Obsidian's <img> renders by content-sniffing, not extension.)
  const thumbnailFile = `${safeFileId(payload.video_id)}.webp`;
  const thumbnailPath = `${rule.thumbnailFolder}/${thumbnailFile}`;
  const imgData = await vaultOps.downloadUrl(payload.thumbnail_url);
  await vaultOps.createBinary(thumbnailPath, imgData);

  const sopContent = readSopSafely(rule.sopPath, vaultOps) ?? builtinSop;
  const section = coverSection(thumbnailFile, sopContent);
  const meta: VideoNoteMeta = {
    platform: payload.platform,
    videoId: videoKey(payload.video_url, payload.platform),
    videoUrl: payload.video_url,
    title: payload.title,
    channel: payload.channel,
    published: payload.published_at,
  };
  return upsertVideoNote(meta, section, vaultOps, rule.outputFolder);
}

async function handleMultiFrame(
  payload: HookPayload | KeyframePayload,
  rule: ClipRule,
  vaultOps: VaultOps,
  searchFolder: string,
  assetFolder: string,
  builtinSop?: string,
): Promise<{ notePath: string; notice?: string }> {
  // ── Pick which frames to keep from the candidates the extension sent ──────────
  // The extension already curates frames; save them as-is, or sample uniformly
  // down to `count` when it sent more than we want to keep.
  const count = (payload.frames_select && payload.frames_select > 0) ? payload.frames_select : (rule.maxFrames ?? 5);
  const sampled = count >= payload.frames.length ? payload.frames : sampleFrames(payload.frames, count);
  const stem = `${payload.mode}-${sanitize(payload.video_title)}-${Date.now()}`;

  const platform = detectPlatform(payload.url);
  const videoId = videoKey(payload.url, platform);
  const meta: VideoNoteMeta = {
    platform,
    videoId,
    videoUrl: payload.url,
    title: payload.video_title,
    channel: payload.mode === 'hook' ? payload.channel : undefined,
  };

  const framesDir = rule.framesFolder || rule.outputFolder;
  await vaultOps.ensureFolder(framesDir);
  const frameNames: string[] = [];
  for (let i = 0; i < sampled.length; i++) {
    const name = `${stem}-f${String(i + 1).padStart(2, '0')}.jpg`;
    const bytes = Buffer.from(sampled[i], 'base64');
    await vaultOps.createBinary(`${framesDir}/${name}`, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
    frameNames.push(name);
  }
  const sopContent = readSopSafely(rule.sopPath, vaultOps) ?? builtinSop;
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
  const result = await upsertVideoNote(meta, section, vaultOps, searchFolder);
  await ensureCover(meta.videoId, payload.cover_url, vaultOps, assetFolder);
  return result;
}
