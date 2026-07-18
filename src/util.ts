import { t } from './i18n';

export function postProcessMarkdown(md: string): string {
  return md.replace(/(?<!`)(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?!`)/g, '`$1`');
}

export function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}

// Guard for URLs we fetch on behalf of the client (covers, thumbnails): only
// real web schemes, so a crafted payload can't reach file:/data:/ftp: etc.
export function assertDownloadable(url: string): void {
  let scheme: string;
  try { scheme = new URL(url).protocol; } catch { throw new Error('Invalid URL'); }
  if (scheme !== 'http:' && scheme !== 'https:') throw new Error('Unsupported URL scheme');
}

// A safe double-quoted YAML scalar for an untrusted value: backslash and quote
// are escaped, newlines flattened to spaces so frontmatter stays one line/key.
export function yamlString(v: string): string {
  const s = String(v ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ');
  return `"${s}"`;
}

// A vault filename component derived from an untrusted id. Only word chars,
// dash and underscore survive; runs of anything else collapse to a single dash.
// Guarantees a non-empty, path-separator-free result.
export function safeFileId(id: string): string {
  const cleaned = (id || '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || 'cover';
}

export function extractVideoId(url: string, platform: string | undefined): string | null {
  const p = (platform ?? '').toLowerCase();
  if (p === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (short) return short[1];
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watch) return watch[1];
    const embed = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (embed) return embed[1];
  }
  if (p === 'bilibili' || url.includes('bilibili.com')) {
    const bv = url.match(/\/(BV[a-zA-Z0-9]+)/);
    if (bv) return bv[1];
  }
  if (p === 'xiaohongshu' || url.includes('xiaohongshu.com')) {
    const m = url.match(/\/(?:explore|discovery\/item)\/(\w+)/);
    if (m) return m[1];
  }
  return null;
}

function canonicalUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).replace(/\/+$/, '');
  } catch {
    return url;
  }
}

// Key used to merge captures of the same thing into one note. Platform ids
// (YouTube/Bilibili/Xiaohongshu) collapse a video's many URL variants; for any
// other platform the page URL (minus query/hash) is a stable enough key.
export function videoKey(url: string, platform?: string): string {
  return extractVideoId(url, platform) ?? canonicalUrl(url);
}

export function detectPlatform(url: string): string {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('bilibili.com')) return 'bilibili';
  if (url.includes('xiaohongshu.com')) return 'xiaohongshu';
  return 'other';
}

export function buildVideoEmbed(url: string, platform: string | undefined, startSeconds: number, endSeconds?: number): string {
  const p = (platform ?? '').toLowerCase();
  // Players only accept integer seconds — a float (from video.currentTime) is
  // silently ignored and playback falls back to 0.
  const start = Math.floor(startSeconds);
  if (p === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = extractVideoId(url, platform);
    if (id) {
      const endParam = endSeconds != null ? `&end=${Math.floor(endSeconds)}` : '';
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}?start=${start}${endParam}" frameborder="0" allowfullscreen></iframe>`;
    }
  }
  if (p === 'bilibili' || url.includes('bilibili.com')) {
    const id = extractVideoId(url, platform);
    // Bilibili's embed player autoplays by default — with several 动效 embeds in one
    // note they all start at once. autoplay=0 stops that; danmaku=0 keeps replays clean.
    if (id) return `<iframe width="100%" height="315" src="https://player.bilibili.com/player.html?bvid=${id}&page=1&t=${start}&autoplay=0&danmaku=0" frameborder="0" allowfullscreen></iframe>`;
  }
  return `[${t('note.openOriginal')}](${url})`;
}
