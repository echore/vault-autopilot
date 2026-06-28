import { buildVideoEmbed, sanitize } from './util';

export type SectionKind = '封面标题' | '内容' | '动效';
const RANK: Record<SectionKind, number> = { '封面标题': 0, '内容': 1, '动效': 2 };

export interface VideoNoteMeta {
  platform: string;
  videoId: string;
  videoUrl: string;
  title: string;
  channel?: string | null;
}

export interface NewSection {
  kind: SectionKind;
  startSeconds: number;
  text: string; // full "## heading\n...body" block; 动效 heading uses ① placeholder
}

export function circledNumber(i: number): string {
  return i >= 1 && i <= 20 ? String.fromCodePoint(0x2460 + i - 1) : `(${i})`;
}

export function sopBlock(sopContent: string): string {
  const lines = sopContent.split('\n').map((l) => `> ${l}`).join('\n');
  const checklist = ['> ', '> ---', '> **完成后执行：**', '> - [ ] 分析已写入笔记各章节', '> - [ ] 删除此整个提示块'].join('\n');
  return `> [!TIP] 分析提示\n${lines}\n${checklist}`;
}

function framesBlock(frameNames: string[]): string {
  const lines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join('\n');
  return `> [!NOTE] 分析用帧\n${lines}\n> \n> - [ ] 按 SOP 完成分析，填入各章节`;
}

export function coverSection(coverFile: string, sop?: string): NewSection {
  const parts = [`## 封面标题`, ``, `![[${coverFile}]]`, ``];
  if (sop) parts.push(sopBlock(sop), ``);
  return { kind: '封面标题', startSeconds: 0, text: parts.join('\n') };
}

export function hookSection(
  p: { url: string; platform?: string; endSeconds: number; frameNames: string[]; transcript?: string; aiResult?: string },
  sop?: string,
): NewSection {
  const embed = buildVideoEmbed(p.url, p.platform, 0, p.endSeconds);
  const parts = [`## 内容 · 0s–${p.endSeconds}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (p.transcript) parts.push(`### 字幕`, ``, p.transcript, ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: '内容', startSeconds: 0, text: parts.join('\n') };
}

export function keyframeSection(
  p: { url: string; platform?: string; start: number; end: number; frameNames: string[]; aiResult?: string },
  sop?: string,
): NewSection {
  const embed = buildVideoEmbed(p.url, p.platform, p.start, p.end);
  const parts = [`## 动效 ① · ${p.start}s–${p.end}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: '动效', startSeconds: p.start, text: parts.join('\n') };
}

export function buildAnchor(meta: VideoNoteMeta): string {
  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    `---`, `type: video`, `platform: ${meta.platform}`,
    `video_id: "${meta.videoId}"`, `video_url: "${meta.videoUrl}"`,
    `title: "${meta.title}"`,
    ...(meta.channel ? [`channel: "${meta.channel}"`] : []),
    `dimensions: []`, `analyzed_at: ${today}`, `tags: []`, `depth: normal`, `---`,
  ].join('\n');
  return `${fm}\n\n# ${meta.title}\n`;
}

interface ParsedSection { kind: SectionKind; startSeconds: number; text: string; }

function kindOf(heading: string): SectionKind | null {
  if (heading.startsWith('封面标题')) return '封面标题';
  if (heading.startsWith('内容')) return '内容';
  if (heading.startsWith('动效')) return '动效';
  return null;
}

function parseSections(body: string): { head: string; sections: ParsedSection[] } {
  const lines = body.split('\n');
  const head: string[] = [];
  const sections: ParsedSection[] = [];
  let cur: string[] | null = null;
  let curHeading = '';
  const flush = () => {
    if (cur) {
      const kind = kindOf(curHeading) ?? '动效';
      const m = curHeading.match(/(\d+)s/);
      sections.push({ kind, startSeconds: m ? parseInt(m[1], 10) : 0, text: cur.join('\n') });
    }
  };
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && line.startsWith('## ')) {
      flush();
      cur = [line];
      curHeading = line.slice(3).trim();
    } else if (cur) {
      cur.push(line);
    } else {
      head.push(line);
    }
  }
  flush();
  return { head: head.join('\n'), sections };
}

const DIMENSION_ORDER: SectionKind[] = ['封面标题', '内容', '动效'];

function addDimension(frontmatter: string, dim: string): string {
  return frontmatter.replace(/^(dimensions:\s*\[)([^\]]*)(\])/m, (_, open, inner, close) => {
    const dims = inner.split(',').map((d: string) => d.trim()).filter(Boolean);
    if (!dims.includes(dim)) dims.push(dim);
    dims.sort((a, b) => DIMENSION_ORDER.indexOf(a as SectionKind) - DIMENSION_ORDER.indexOf(b as SectionKind));
    return `${open}${dims.join(', ')}${close}`;
  });
}

function renumber(sections: ParsedSection[]): ParsedSection[] {
  let n = 0;
  return sections.map((s) => {
    if (s.kind !== '动效') return s;
    n += 1;
    const text = s.text.replace(/^(## 动效 )\S+( ·.*)?$/m, `$1${circledNumber(n)}$2`);
    return { ...s, text };
  });
}

export function mergeSection(existing: string, section: NewSection): { content: string; skipped: boolean } {
  const fmMatch = existing.match(/^---\n[\s\S]*?\n---/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;

  const { head, sections } = parseSections(body);

  if (section.kind !== '动效' && sections.some((s) => s.kind === section.kind)) {
    return { content: existing, skipped: true };
  }

  const incoming: ParsedSection = { kind: section.kind, startSeconds: section.startSeconds, text: section.text };
  const all = [...sections, incoming].sort((a, b) =>
    RANK[a.kind] - RANK[b.kind] || a.startSeconds - b.startSeconds,
  );
  const ordered = renumber(all);

  const newFrontmatter = addDimension(frontmatter, section.kind);
  const newBody = [head.replace(/\s+$/, ''), '', ordered.map((s) => s.text.replace(/\s+$/, '')).join('\n\n'), ''].join('\n');
  return { content: `${newFrontmatter}${newBody}`, skipped: false };
}

// Re-export sanitize for use in clip-router.ts via this module (avoids double import)
export { sanitize };
