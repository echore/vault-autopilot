import { buildAnchor, mergeSection, coverSection, hookSection, keyframeSection, screenshotSection, VideoNoteMeta } from '../src/video-note';
import { setLanguage } from '../src/i18n';

beforeEach(() => setLanguage('zh'));
afterEach(() => setLanguage('en'));

test('screenshot sections sort after 动效 and renumber ①②', () => {
  let c = buildAnchor({ platform: 'youtube', videoId: 'abc123', videoUrl: 'https://www.youtube.com/watch?v=abc123', title: 'Bee' });
  c = mergeSection(c, keyframeSection({ url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube', start: 45, end: 52, frameNames: ['k.png'] })).content;
  c = mergeSection(c, screenshotSection(['s1.png'])).content;
  c = mergeSection(c, screenshotSection(['s2.png'])).content;
  expect(c.indexOf('## ✨ 动效')).toBeLessThan(c.indexOf('## 📸 截图'));
  expect(c).toContain('## 📸 截图 ①');
  expect(c).toContain('## 📸 截图 ②');
  expect(c).toContain('dimensions: [动效, 截图]');
});

test('render adds emoji headings, --- dividers (no stacking), and a top overview', () => {
  let c = buildAnchor({ platform: 'youtube', videoId: 'abc123', videoUrl: 'https://www.youtube.com/watch?v=abc123', title: 'Bee', channel: 'Ali' });
  c = mergeSection(c, coverSection('cover.webp')).content;
  c = mergeSection(c, keyframeSection({ url: 'https://www.youtube.com/watch?v=abc123', platform: 'youtube', start: 10, end: 14, frameNames: ['k.png'] })).content;
  const bodyDividers = (s: string) => ((s.replace(/^---\n[\s\S]*?\n---\n/, '').match(/^---$/gm)) || []).length;
  // dividers separate the two sections, exactly once
  expect(bodyDividers(c)).toBe(1);
  // emoji headings + overview callout
  expect(c).toContain('## 🖼️ 封面标题');
  expect(c).toContain('## ✨ 动效 ①');
  expect(c).toContain('> [!abstract] Ali · youtube');
  // a third merge must not stack a second divider between the same pair
  c = mergeSection(c, screenshotSection(['s.png'])).content;
  expect(bodyDividers(c)).toBe(2); // 3 sections → 2 dividers
});

test('upgrades an old emoji-less heading on the next merge', () => {
  // simulate a note created before the emoji change
  const old = `---\ntype: video\nplatform: youtube\nvideo_id: "abc123"\nvideo_url: "u"\ntitle: "Bee"\ndimensions: [内容]\n---\n\n# Bee\n\n## 内容\n\nbody\n`;
  const c = mergeSection(old, screenshotSection(['s.png'])).content;
  expect(c).toContain('## 🎬 内容');
  expect(c).not.toMatch(/^## 内容$/m);
});

const meta: VideoNoteMeta = {
  platform: 'youtube', videoId: 'abc123',
  videoUrl: 'https://www.youtube.com/watch?v=abc123',
  title: 'Bee Keeper', channel: 'NatureCh',
};

test('anchor has frontmatter with video_id and the title heading', () => {
  const a = buildAnchor(meta);
  expect(a).toContain('video_id: "abc123"');
  expect(a).toContain('dimensions: []');
  expect(a).toContain('# Bee Keeper');
});

test('cover then hook then keyframe ends ordered cover<hook<动效', () => {
  let c = buildAnchor(meta);
  c = mergeSection(c, hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
  c = mergeSection(c, coverSection('cover.jpg')).content;
  c = mergeSection(c, keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['k1.png'] })).content;
  const iCover = c.indexOf('## 🖼️ 封面标题');
  const iHook = c.indexOf('## 🎬 内容');
  const iKf = c.indexOf('## ✨ 动效');
  expect(iCover).toBeGreaterThanOrEqual(0);
  expect(iCover).toBeLessThan(iHook);
  expect(iHook).toBeLessThan(iKf);
  expect(c).toContain('dimensions: [封面标题, 内容, 动效]');
});

test('multiple 动效 sort by start time and renumber ①②', () => {
  let c = buildAnchor(meta);
  c = mergeSection(c, keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['a.png'] })).content;
  c = mergeSection(c, keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['b.png'] })).content;
  const first = c.indexOf('45s');
  const second = c.indexOf('130s');
  expect(first).toBeLessThan(second);
  expect(c).toContain('## ✨ 动效 ① · 45s–52s');
  expect(c).toContain('## ✨ 动效 ② · 130s–138s');
});

test('singular 内容 re-capture is skipped and preserves user text', () => {
  let c = buildAnchor(meta);
  c = mergeSection(c, hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'], transcript: 'sub' })).content;
  c = c.replace('### 字幕', 'MY ANALYSIS\n\n### 字幕'); // user edits
  const r = mergeSection(c, hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f2.png'] }));
  expect(r.skipped).toBe(true);
  expect(r.content).toContain('MY ANALYSIS');
  expect((r.content.match(/## 🎬 内容/g) || []).length).toBe(1);
});

test('a ## line inside a user code fence is NOT treated as a section', () => {
  let c = buildAnchor(meta);
  c = mergeSection(c, keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['k.png'] })).content;
  // user pastes a fenced markdown example containing a "## " line into their analysis
  c = c.replace('![[k.png]]', '![[k.png]]\n\n```md\n## 这是示例标题\n```');
  const r = mergeSection(c, keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['k2.png'] }));
  // only two real 动效 sections, fenced example untouched, correct numbering
  expect((r.content.match(/^## ✨ 动效/gm) || []).length).toBe(2);
  expect(r.content).toContain('## 这是示例标题');
  expect(r.content).toContain('## ✨ 动效 ① · 45s–52s');
  expect(r.content).toContain('## ✨ 动效 ② · 130s–138s');
});

test('hook section embeds the whole video from start (no end) + frames + 字幕', () => {
  const s = hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'], transcript: 'hello' });
  expect(s.kind).toBe('content');
  expect(s.text).toContain('embed/abc123?start=0');
  expect(s.text).not.toContain('end=');
  expect(s.text).toContain('![[f1.png]]');
  expect(s.text).toContain('### 字幕');
  expect(s.text).toContain('hello');
});

test('keyframe section cues to the segment start with no end cap', () => {
  const s = keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['k.png'] });
  expect(s.text).toContain('embed/abc123?start=45');
  expect(s.text).not.toContain('end=');
  expect(s.text).toContain('## 动效 ① · 45s–52s');
});

test('keyframe on a Bilibili url builds a Bilibili player cued to start', () => {
  const s = keyframeSection({ url: 'https://www.bilibili.com/video/BV1xx411c7mD/', platform: 'bilibili', start: 30, end: 40, frameNames: ['k.png'] });
  expect(s.text).toContain('player.bilibili.com/player.html?bvid=BV1xx411c7mD');
  expect(s.text).toContain('t=30');
  expect(s.text).not.toContain('youtube.com/embed');
});

test('keyframe float times become integer seconds in embed and heading', () => {
  const s = keyframeSection({ url: meta.videoUrl, platform: 'youtube', start: 369.35182, end: 386.119189, frameNames: ['k.png'] });
  expect(s.text).toContain('embed/abc123?start=369');
  expect(s.text).not.toContain('369.35');
  expect(s.text).toContain('## 动效 ① · 369s–386s');
});

describe('bilingual headings', () => {
  const bMeta: VideoNoteMeta = {
    platform: 'youtube', videoId: 'abc123',
    videoUrl: 'https://www.youtube.com/watch?v=abc123',
    title: 'Bee Keeper', channel: 'NatureCh',
  };

  test('English mode writes English headings and dimensions', () => {
    setLanguage('en');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, coverSection('cover.webp')).content;
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['k.png'] })).content;
    expect(c).toContain('## 🖼️ Cover & Title');
    expect(c).toContain('## ✨ Motion ① · 45s–52s');
    expect(c).toContain('dimensions: [Cover & Title, Motion]');
  });

  test('English section appended to a Chinese note: recognized, ordered, renumbered', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['a.png'] })).content;
    setLanguage('en');
    const note = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['b.png'] })).content;
    // Chinese hook still recognized and stays before both motion sections
    expect(note.indexOf('## 🎬 内容')).toBeGreaterThanOrEqual(0);
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('## ✨ Motion ①'));
    // Mixed-language motion sections renumber as one sequence, sorted by start time
    expect(note).toContain('## ✨ Motion ① · 45s–52s');
    expect(note).toContain('## ✨ 动效 ② · 130s–138s');
  });

  test('singular-section skip works across languages', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
    setLanguage('en');
    const r = mergeSection(c, hookSection({ url: bMeta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f2.png'] }));
    expect(r.skipped).toBe(true);
  });

  test('dimensions dedupe by kind across languages', () => {
    setLanguage('zh');
    let c = buildAnchor(bMeta);
    c = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 130, end: 138, frameNames: ['a.png'] })).content;
    setLanguage('en');
    const note = mergeSection(c, keyframeSection({ url: bMeta.videoUrl, platform: 'youtube', start: 45, end: 52, frameNames: ['b.png'] })).content;
    // motion is already listed as 动效 — appending an English Motion section must not add a second entry
    expect(note).toContain('dimensions: [动效]');
    expect(note).not.toContain('dimensions: [动效, Motion]');
  });
});
