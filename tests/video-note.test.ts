import { buildAnchor, mergeSection, coverSection, hookSection, keyframeSection, VideoNoteMeta } from '../src/video-note';

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
  const iCover = c.indexOf('## 封面标题');
  const iHook = c.indexOf('## 内容');
  const iKf = c.indexOf('## 动效');
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
  expect(c).toContain('## 动效 ① · 45s–52s');
  expect(c).toContain('## 动效 ② · 130s–138s');
});

test('singular 内容 re-capture is skipped and preserves user text', () => {
  let c = buildAnchor(meta);
  c = mergeSection(c, hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'] })).content;
  c = c.replace('### 字幕', 'MY ANALYSIS\n\n### 字幕'); // user edits
  const r = mergeSection(c, hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f2.png'] }));
  expect(r.skipped).toBe(true);
  expect(r.content).toContain('MY ANALYSIS');
  expect((r.content.match(/## 内容/g) || []).length).toBe(1);
});

test('hook section embeds a 0-end clip and keeps frames + 字幕', () => {
  const s = hookSection({ url: meta.videoUrl, platform: 'youtube', endSeconds: 15, frameNames: ['f1.png'], transcript: 'hello' });
  expect(s.kind).toBe('内容');
  expect(s.text).toContain('embed/abc123?start=0&end=15');
  expect(s.text).toContain('![[f1.png]]');
  expect(s.text).toContain('### 字幕');
  expect(s.text).toContain('hello');
});
