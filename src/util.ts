export function postProcessMarkdown(md: string): string {
  return md.replace(/(?<!`)(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?!`)/g, '`$1`');
}

export function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
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
  return null;
}

export function buildVideoEmbed(url: string, platform: string | undefined, startSeconds: number): string {
  const p = (platform ?? '').toLowerCase();
  if (p === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = extractVideoId(url, platform);
    if (id) return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${id}?start=${startSeconds}" frameborder="0" allowfullscreen></iframe>`;
  }
  if (p === 'bilibili' || url.includes('bilibili.com')) {
    const id = extractVideoId(url, platform);
    if (id) return `<iframe width="100%" height="315" src="https://player.bilibili.com/player.html?bvid=${id}&page=1&t=${startSeconds}" frameborder="0" allowfullscreen></iframe>`;
  }
  return `[▶ 跳转原视频](${url})`;
}
