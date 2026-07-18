import { t } from './i18n';

// Serializes async tasks: each runs only after the previous settles, so two
// in-flight clips can't interleave their read-modify-write on the same note.
// A rejection reaches its own caller but never poisons the chain.
export function makeSerialQueue(): <T>(task: () => Promise<T>) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve();
  return (task) => {
    const result = tail.then(task, task);
    tail = result.catch(() => undefined);
    return result;
  };
}

export function postProcessMarkdown(md: string): string {
  return md.replace(/(?<!`)(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?!`)/g, '`$1`');
}

export function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|#^\[\]`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}

// Literal private/loopback/link-local hosts. The WHATWG URL parser already
// canonicalizes hex/octal/integer IPv4 forms (0x7f000001 → 127.0.0.1), so the
// dotted-decimal check covers those. Hostnames that merely RESOLVE to private
// IPs are accepted — DNS-rebinding protection is out of scope for a desktop
// plugin talking to public CDNs.
function isPrivateHost(hostname: string): boolean {
  let h = hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
  if (h === 'localhost' || h.endsWith('.local')) return true;
  if (h.startsWith('::ffff:')) {
    // IPv4-mapped IPv6; the URL parser serializes it as hex groups
    // ([::ffff:127.0.0.1] → ::ffff:7f00:1), so decode back to dotted form.
    const rest = h.slice(7);
    const hex = rest.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      h = `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
    } else {
      h = rest;
    }
  }
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    return a === 0 || a === 10 || a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254);
  }
  if (h.includes(':')) {
    return h === '::1' || h === '::' || /^f[cd]/.test(h) || /^fe[89ab]/.test(h);
  }
  return false;
}

// Guard for URLs we fetch on behalf of the client (covers, thumbnails): only
// real web schemes to public hosts, so a crafted payload can't reach
// file:/data:/ftp: or pivot the plugin into localhost / LAN / cloud metadata.
export function assertDownloadable(url: string): void {
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new Error('Invalid URL'); }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Unsupported URL scheme');
  if (isPrivateHost(parsed.hostname)) throw new Error('Blocked host');
}

// Untrusted text interpolated into markdown structure (headings, callout
// labels): newlines flattened and backticks dropped so it can never open a
// fence or spill onto a structural line. null/undefined become ''.
export function inlineText(v: unknown): string {
  return String(v ?? '').replace(/`/g, '').replace(/[\r\n]+/g, ' ').trim();
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
    const embed = url.match(/(?:embed|shorts|live)\/([a-zA-Z0-9_-]+)/);
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
