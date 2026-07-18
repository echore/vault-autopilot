import { buildVideoEmbed, sanitize, yamlString } from './util';
import { t, variants, LocaleKey } from './i18n';

export type SectionKind = 'cover' | 'content' | 'motion' | 'screenshot';

// Display order of sections in a note; index doubles as the sort rank.
const KINDS: SectionKind[] = ['cover', 'content', 'motion', 'screenshot'];
const HEADING_KEY: Record<SectionKind, LocaleKey> = {
  cover: 'note.heading.cover',
  content: 'note.heading.content',
  motion: 'note.heading.motion',
  screenshot: 'note.heading.screenshot',
};
const EMOJI: Record<SectionKind, string> = { cover: '🖼️', content: '🎬', motion: '✨', screenshot: '📸' };

export function headingLabel(kind: SectionKind): string {
  return t(HEADING_KEY[kind]);
}

function labelVariants(kind: SectionKind): string[] {
  return variants(HEADING_KEY[kind]);
}

// Exact-match a frontmatter dimension label (either language) back to its kind.
export function labelToKind(label: string): SectionKind | null {
  for (const k of KINDS) if (labelVariants(k).includes(label)) return k;
  return null;
}

export interface VideoNoteMeta {
  platform: string;
  videoId: string;
  videoUrl: string;
  title: string;
  channel?: string | null;
  published?: string | null;
}

export interface NewSection {
  kind: SectionKind;
  startSeconds: number;
  text: string; // full "## heading\n...body" block; motion heading uses ① placeholder
}

export function circledNumber(i: number): string {
  return i >= 1 && i <= 20 ? String.fromCodePoint(0x2460 + i - 1) : `(${i})`;
}

export function sopBlock(sopContent: string): string {
  const lines = sopContent.split('\n').map((l) => `> ${l}`).join('\n');
  const checklist = ['> ', '> ---', `> **${t('note.sopDone')}**`, `> - [ ] ${t('note.sopStep1')}`, `> - [ ] ${t('note.sopStep2')}`].join('\n');
  return `> [!TIP] ${t('note.sopCalloutTitle')}\n${lines}\n${checklist}`;
}

function framesBlock(frameNames: string[]): string {
  const lines = frameNames.map((n, i) => `> **[Image #${i + 1}]** ![[${n}]]`).join('\n');
  return `> [!NOTE] ${t('note.framesCalloutTitle')}\n${lines}\n> \n> - [ ] ${t('note.framesChecklist')}`;
}

export function coverSection(coverFile: string, sop?: string): NewSection {
  const parts = [`## ${headingLabel('cover')}`, ``, `![[${coverFile}]]`, ``];
  if (sop) parts.push(sopBlock(sop), ``);
  return { kind: 'cover', startSeconds: 0, text: parts.join('\n') };
}

export function hookSection(
  p: { url: string; platform?: string; endSeconds: number; frameNames: string[]; transcript?: string; aiResult?: string },
  sop?: string,
): NewSection {
  // Hook is always at the very front — embed the whole video from the start
  // (no end cap; the captured cut-off point doesn't matter for a hook).
  const embed = buildVideoEmbed(p.url, p.platform, 0);
  const parts = [`## ${headingLabel('content')}`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (p.transcript) parts.push(`### ${t('note.transcript')}`, ``, p.transcript, ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: 'content', startSeconds: 0, text: parts.join('\n') };
}

export function keyframeSection(
  p: { url: string; platform?: string; start: number; end: number; frameNames: string[]; aiResult?: string },
  sop?: string,
): NewSection {
  // Cue the player to the START of this segment (no end cap).
  const embed = buildVideoEmbed(p.url, p.platform, p.start);
  // Integer seconds in the heading: clean display + parseable for re-sorting.
  const parts = [`## ${headingLabel('motion')} ① · ${Math.floor(p.start)}s–${Math.round(p.end)}s`, ``, embed, ``];
  if (p.aiResult) {
    parts.push(p.aiResult, ``);
  } else {
    parts.push(framesBlock(p.frameNames), ``);
    if (sop) parts.push(sopBlock(sop), ``);
  }
  return { kind: 'motion', startSeconds: p.start, text: parts.join('\n') };
}

export function screenshotSection(imageNames: string[], sop?: string, aiResult?: string): NewSection {
  const imgs = imageNames.map((n) => `![[${n}]]`).join('\n');
  const parts = [`## ${headingLabel('screenshot')} ①`, ``, imgs, ``];
  if (aiResult) parts.push(aiResult, ``);
  else if (sop) parts.push(sopBlock(sop), ``);
  return { kind: 'screenshot', startSeconds: 0, text: parts.join('\n') };
}

export function buildAnchor(meta: VideoNoteMeta): string {
  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    `---`, `type: video`, `platform: ${meta.platform}`,
    `video_id: ${yamlString(meta.videoId)}`, `video_url: ${yamlString(meta.videoUrl)}`,
    `title: ${yamlString(meta.title)}`,
    ...(meta.channel ? [`channel: ${yamlString(meta.channel)}`] : []),
    ...(meta.published ? [`published: ${meta.published}`] : []),
    `dimensions: []`, `analyzed_at: ${today}`, `tags: []`, `depth: normal`, `---`,
  ].join('\n');
  return `${fm}\n\n# ${meta.title}\n`;
}

// Backfill path: notes created by hook/keyframe (or an older version) have no
// `published` — patch it into the frontmatter the next time a thumbnail clip
// for the same video arrives with one.
export function ensurePublished(content: string, published?: string | null): string {
  if (!published || !content.startsWith('---\n')) return content;
  const end = content.indexOf('\n---', 4);
  if (end === -1) return content;
  const fm = content.slice(0, end);
  if (/^published:/m.test(fm)) return content;
  return `${fm}\npublished: ${published}${content.slice(end)}`;
}

interface ParsedSection { kind: SectionKind; startSeconds: number; text: string; }

function kindOf(heading: string): SectionKind | null {
  // Substring match so an emoji prefix (## 🎬 内容) still resolves to its kind.
  // Both languages are checked so notes written under either setting keep parsing.
  for (const k of KINDS) {
    for (const label of labelVariants(k)) {
      if (heading.includes(label)) return k;
    }
  }
  return null;
}

// Force every heading to `## <emoji> <label…>`, upgrading old headings (no emoji)
// and de-duplicating any existing emoji, so the note stays visually consistent.
// The heading keeps whatever language it was written in.
function emojiHeading(text: string, kind: SectionKind): string {
  return text.replace(/^## .*$/m, (line) => {
    const heading = line.slice(3);
    let tail = headingLabel(kind);
    for (const label of labelVariants(kind)) {
      const idx = heading.indexOf(label);
      if (idx >= 0) { tail = heading.slice(idx); break; }
    }
    return `## ${EMOJI[kind]} ${tail}`;
  });
}

// Drop a trailing horizontal rule (the inter-section separator) plus surrounding
// whitespace, so re-rendering never stacks `---` lines across merges.
function stripTrailingRule(t: string): string {
  return t.replace(/\s+$/, '').replace(/\n-{3,}$/, '').replace(/\s+$/, '');
}

// Rebuild the top [!abstract] overview from the frontmatter + the dimensions
// currently present, preserving any other preamble the user added.
function syncOverview(head: string, frontmatter: string, dims: SectionKind[]): string {
  const channel = frontmatter.match(/^channel:\s*"?(.*?)"?\s*$/m)?.[1];
  const platform = frontmatter.match(/^platform:\s*(.*?)\s*$/m)?.[1];
  const label = [channel, platform].filter(Boolean).join(' · ') || t('note.videoFallback');
  const overview = `> [!abstract] ${label}\n> ${dims.map((d) => `${EMOJI[d]} ${headingLabel(d)}`).join(' · ')}`;
  const cleaned = head.replace(/\n*> \[!abstract\][^\n]*(?:\n>[^\n]*)*/g, '');
  if (/^# .+$/m.test(cleaned)) return cleaned.replace(/^(# .+)$/m, `$1\n\n${overview}`);
  return `${cleaned.replace(/\s+$/, '')}\n\n${overview}`;
}

function parseSections(body: string): { head: string; sections: ParsedSection[] } {
  const lines = body.split('\n');
  const head: string[] = [];
  const sections: ParsedSection[] = [];
  let cur: string[] | null = null;
  let curHeading = '';
  const flush = () => {
    if (cur) {
      const kind = kindOf(curHeading) ?? 'motion';
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

function addDimension(frontmatter: string, kind: SectionKind): string {
  return frontmatter.replace(/^(dimensions:\s*\[)([^\]]*)(\])/m, (_, open, inner, close) => {
    const dims = inner.split(',').map((d: string) => d.trim()).filter(Boolean);
    // Dedupe by kind, not by string — a zh note must not gain a second
    // entry for the same dimension when a section is appended in en.
    if (!dims.some((d: string) => labelToKind(d) === kind)) dims.push(headingLabel(kind));
    const rank = (d: string) => { const k = labelToKind(d); return k ? KINDS.indexOf(k) : -1; };
    dims.sort((a: string, b: string) => rank(a) - rank(b));
    return `${open}${dims.join(', ')}${close}`;
  });
}

function renumber(sections: ParsedSection[]): ParsedSection[] {
  const counters: Partial<Record<SectionKind, number>> = {};
  return sections.map((s) => {
    if (s.kind !== 'motion' && s.kind !== 'screenshot') return s;
    counters[s.kind] = (counters[s.kind] ?? 0) + 1;
    // Labels contain no regex metacharacters (enforced by i18n.test.ts).
    const labels = labelVariants(s.kind).join('|');
    const text = s.text.replace(new RegExp(`^(## .*?(?:${labels}) )\\S+( ·.*)?$`, 'm'), `$1${circledNumber(counters[s.kind]!)}$2`);
    return { ...s, text };
  });
}

export function mergeSection(existing: string, section: NewSection): { content: string; skipped: boolean } {
  const fmMatch = existing.match(/^---\n[\s\S]*?\n---/);
  const frontmatter = fmMatch ? fmMatch[0] : '';
  const body = fmMatch ? existing.slice(frontmatter.length) : existing;

  const { head, sections } = parseSections(body);

  if (section.kind !== 'motion' && section.kind !== 'screenshot' && sections.some((s) => s.kind === section.kind)) {
    return { content: existing, skipped: true };
  }

  const incoming: ParsedSection = { kind: section.kind, startSeconds: section.startSeconds, text: section.text };
  const all = [...sections, incoming].sort((a, b) =>
    KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.startSeconds - b.startSeconds,
  );
  const ordered = renumber(all);

  const newFrontmatter = addDimension(frontmatter, section.kind);
  const dims = KINDS.filter((k) => ordered.some((s) => s.kind === k));
  const newHead = syncOverview(head, newFrontmatter, dims).replace(/\s+$/, '');
  const renderedSections = ordered.map((s) => stripTrailingRule(emojiHeading(s.text, s.kind))).join('\n\n---\n\n');
  const newBody = [newHead, '', renderedSections, ''].join('\n');
  return { content: `${newFrontmatter}${newBody}`, skipped: false };
}

// Re-export sanitize for use in clip-router.ts via this module (avoids double import)
export { sanitize };
