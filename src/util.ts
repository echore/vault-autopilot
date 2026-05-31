export function postProcessMarkdown(md: string): string {
  return md.replace(/(?<!`)(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})\b(?!`)/g, '`$1`');
}

export function sanitize(str: string): string {
  return (str || '').replace(/[/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}
