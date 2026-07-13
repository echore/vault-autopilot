import { routeClip, VaultOps } from '../src/clip-router';
import { ClipRule, ScreenshotClipRule, ThumbnailClipRule } from '../src/types';
import { ClipPayload } from '../src/server';
import { setLanguage } from '../src/i18n';

beforeEach(() => setLanguage('zh'));
afterAll(() => setLanguage('en'));

function makeVaultOps(): jest.Mocked<VaultOps> {
  return {
    ensureFolder: jest.fn().mockResolvedValue(undefined),
    createBinary: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    readFileSync: jest.fn().mockReturnValue('# SOP\nAnalyze this.'),
    downloadUrl: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    fileExists: jest.fn().mockReturnValue(false),
    listMarkdownFiles: jest.fn().mockReturnValue([]),
    read: jest.fn().mockResolvedValue(''),
    modify: jest.fn().mockResolvedValue(undefined),
  };
}

const thumbnailClipRule: ThumbnailClipRule = {
  sopPath: '/thumb-sop.md', outputFolder: 'Content Creation/Great Videos',
  thumbnailFolder: 'Assets/Great Videos',
};
const screenshotClipRule: ScreenshotClipRule = {
  sopPath: '/ss-sop.md', outputFolder: 'Screenshots', framesFolder: 'Assets/images',
};
const hookClipRule: ClipRule = {
  sopPath: '/hook-sop.md', outputFolder: 'Hooks', maxFrames: 5, framesFolder: 'Assets/images',
};
const keyframeClipRule: ClipRule = {
  sopPath: '/kf-sop.md', outputFolder: 'Keyframes', maxFrames: 5, framesFolder: 'Assets/images',
};
const clipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook: hookClipRule, keyframe: keyframeClipRule };

// ── thumbnail ─────────────────────────────────────────────────────────────────

describe('routeClip — thumbnail', () => {
  const payload: ClipPayload = {
    mode: 'thumbnail',
    platform: 'youtube',
    video_id: 'abc123',
    video_url: 'https://www.youtube.com/watch?v=abc123',
    thumbnail_url: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg',
    title: 'How to Get Rich on Easy Mode',
    channel: 'Ali Abdaal',
    channel_handle: '@aliabdaal',
    views: '27.8万',
    captured_at: '2026-05-31T00:00:00Z',
  };

  test('manual: downloads thumbnail and creates note with correct frontmatter', async () => {
    const vaultOps = makeVaultOps();
    await routeClip(payload, clipRules, vaultOps);
    expect(vaultOps.downloadUrl).toHaveBeenCalledWith(payload.thumbnail_url);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      'Assets/Great Videos/abc123.webp',
      expect.any(ArrayBuffer),
    );
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(notePath).toBe('Content Creation/Great Videos/Ali Abdaal - How to Get Rich on Easy Mode.md');
    expect(noteContent).toContain('type: video');
    expect(noteContent).toContain('video_id: "abc123"');
    expect(noteContent).toContain('channel: "Ali Abdaal"');
    expect(noteContent).toContain('dimensions: [封面标题]');
    expect(noteContent).toContain('![[abc123.webp]]');
    expect(noteContent).toContain('## 🖼️ 封面标题');
  });

  test('note filename omits the author segment when channel is empty', async () => {
    const vaultOps = makeVaultOps();
    const noChannel = { ...payload, channel: '' } as ClipPayload;
    const result = await routeClip(noChannel, clipRules, vaultOps);
    expect(result.notePath).toBe('Content Creation/Great Videos/How to Get Rich on Easy Mode.md');
  });

  test('non-YT/Bili platform: no youtube embed, no channel/views in frontmatter, image in cover', async () => {
    const vaultOps = makeVaultOps();
    const generic: ClipPayload = {
      mode: 'thumbnail',
      platform: 'other',
      video_id: 'twitter-com-i-status-123',
      video_url: 'https://twitter.com/u/status/123',
      thumbnail_url: 'https://pbs.twimg.com/x.jpg',
      title: 'A Tweet Video',
      source_name: 'Twitter',
      channel: null,
      views: null,
      captured_at: '2026-06-27T00:00:00Z',
    };
    await routeClip(generic, clipRules, vaultOps);
    const [, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(noteContent).not.toContain('youtube.com/embed');
    expect(noteContent).not.toContain('channel: "');
    expect(noteContent).toContain('![[twitter-com-i-status-123.webp]]');
    expect(noteContent).toContain('## 🖼️ 封面标题');
  });
});

// ── screenshot ────────────────────────────────────────────────────────────────

describe('routeClip — screenshot', () => {
  test('manual: saves images to framesFolder and creates template note', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'screenshot',
      images: [Buffer.from('pixels').toString('base64'), Buffer.from('pixels2').toString('base64')],
      url: 'https://x.com',
      title: 'My Screenshot',
    };
    const result = await routeClip(payload, clipRules, vaultOps);
    expect(result.notePath).toMatch(/^Screenshots\/screenshot-.+\.md$/);
    expect(vaultOps.createBinary).toHaveBeenCalledTimes(2);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Assets/images/'),
      expect.any(ArrayBuffer),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Screenshots\/screenshot-.+\.md/),
      expect.stringContaining('# Screenshot — My Screenshot'),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('![['),
    );
  });

  test('backward compat: old image field is normalized to images array', async () => {
    const vaultOps = makeVaultOps();
    const payload = {
      mode: 'screenshot' as const,
      image: Buffer.from('pixels').toString('base64'),
      url: 'https://x.com',
      title: 'Old Format',
    } as unknown as ClipPayload;
    await routeClip(payload, clipRules, vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledTimes(1);
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Screenshots\/screenshot-.+\.md/),
      expect.stringContaining('# Screenshot — Old Format'),
    );
  });
});

// ── manual mode ───────────────────────────────────────────────────────────────

describe('routeClip — manual mode (hook)', () => {
  const manualHookRule: ClipRule = {
    sopPath: '', outputFolder: 'Hooks', maxFrames: 3, framesFolder: 'Assets/images',
  };
  const manualClipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:manualHookRule, keyframe: keyframeClipRule };

  test('saves sampled frames as PNG files', async () => {
    const vaultOps = makeVaultOps();
    const frames = Array.from({ length: 6 }, (_, i) => Buffer.from(`frame${i}`).toString('base64'));
    const payload: ClipPayload = {
      mode: 'hook', frames, video_title: 'Test Hook',
      url: 'https://youtube.com/watch?v=abc', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, manualClipRules, vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledTimes(3);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringMatching(/Assets\/images\/hook-.+-f01\.png/),
      expect.any(ArrayBuffer),
    );
  });

  test('writes merged note in Great Videos with ## 🎬 内容 section, frame embeds, transcript', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64'), Buffer.from('f2').toString('base64')],
      video_title: 'My Hook', transcript: 'Hello world',
      url: 'https://youtube.com/watch?v=abc', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, manualClipRules, vaultOps);
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    // Hook now goes into the Great Videos (thumbnail outputFolder) as a merged note
    expect(notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(noteContent).toContain('## 🎬 内容');
    expect(noteContent).toContain('<iframe');
    expect(noteContent).toContain('youtube.com/embed/');
    expect(noteContent).toContain('[Image #1]');
    expect(noteContent).toContain('![[');
    expect(noteContent).toContain('Hello world');
  });
});

describe('routeClip — manual mode (keyframe)', () => {
  const manualKeyframeRule: ClipRule = {
    sopPath: '', outputFolder: 'Keyframes', maxFrames: 5, framesFolder: 'Assets/images',
  };
  const manualClipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:hookClipRule, keyframe: manualKeyframeRule };

  test('writes merged note in Great Videos with ## ✨ 动效 section, time range embed', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video', url: 'https://youtube.com/watch?v=xyz',
      time_range: { start: 30, end: 45 }, captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, manualClipRules, vaultOps);
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    // Keyframe now goes into Great Videos as a merged note
    expect(notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(noteContent).toContain('## ✨ 动效');
    expect(noteContent).toContain('<iframe');
    expect(noteContent).toContain('start=30');
  });
});

// ── V2: append to existing note ───────────────────────────────────────────────

describe('routeClip — append to existing Great Videos note', () => {
  const existingNote = [
    `---`,
    `type: video`,
    `video_id: "abc123"`,
    `dimensions: [封面标题]`,
    `---`,
    ``,
    `# My Video`,
    ``,
    `## 🖼️ 封面标题`,
    `分析内容`,
  ].join('\n');

  test('hook: finds existing note by video_id and appends ## 🎬 内容 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualHookRule = { ...hookClipRule, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, { ...clipRules, hook: manualHookRule }, vaultOps);
    expect(vaultOps.modify).toHaveBeenCalledWith(
      'Content Creation/Great Videos/note.md',
      expect.stringContaining('## 🎬 内容'),
    );
    const [, modifiedContent] = (vaultOps.modify as jest.Mock).mock.calls[0];
    expect(modifiedContent).toContain('dimensions: [封面标题, 内容]');
    expect(modifiedContent).toContain('[Image #1]');
    expect(vaultOps.create).not.toHaveBeenCalled();
  });

  test('keyframe: finds existing note and appends ## ✨ 动效 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualKeyframeRule = { ...keyframeClipRule, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      time_range: { start: 10, end: 20 },
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, { ...clipRules, keyframe: manualKeyframeRule }, vaultOps);
    const [, modifiedContent] = (vaultOps.modify as jest.Mock).mock.calls[0];
    expect(modifiedContent).toContain('## ✨ 动效');
    expect(modifiedContent).toContain('dimensions: [封面标题, 动效]');
  });

  test('append returns the existing note path (for obsidian deep link)', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualHookRule = { ...hookClipRule, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      captured_at: '2026-05-31T00:00:00Z',
    };
    const result = await routeClip(payload, { ...clipRules, hook: manualHookRule }, vaultOps);
    expect(result.notePath).toBe('Content Creation/Great Videos/note.md');
  });

  test('no existing note: creates new note in Great Videos with ## 🎬 内容 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue([]);
    const manualHookRule = { ...hookClipRule, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'New Video',
      url: 'https://www.youtube.com/watch?v=newvid',
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, { ...clipRules, hook: manualHookRule }, vaultOps);
    expect(vaultOps.modify).not.toHaveBeenCalled();
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('Content Creation/Great Videos/'),
      expect.stringContaining('## 🎬 内容'),
    );
  });
});

// ── unified video note (manual) ───────────────────────────────────────────────

describe('routeClip — unified video note (manual)', () => {
  const manual = {
    thumbnail: { ...thumbnailClipRule },
    screenshot: screenshotClipRule,
    hook: { ...hookClipRule, sopPath: '' },
    keyframe: { ...keyframeClipRule, sopPath: '' },
  };
  function vaultWithStore() {
    const store: Record<string, string> = {};
    const v = makeVaultOps();
    (v.create as jest.Mock).mockImplementation(async (p: string, c: string) => { store[p] = c; });
    (v.modify as jest.Mock).mockImplementation(async (p: string, c: string) => { store[p] = c; });
    (v.read as jest.Mock).mockImplementation(async (p: string) => store[p] ?? '');
    (v.listMarkdownFiles as jest.Mock).mockImplementation(() => Object.keys(store));
    return { v, store };
  }
  const hookPayload = { mode: 'hook' as const, frames: ['Zg=='], video_title: 'Bee', url: 'https://www.youtube.com/watch?v=abc123', captured_at: '2026-06-28T00:00:00Z' };
  const kfPayload = (start: number, end: number) => ({ mode: 'keyframe' as const, frames: ['Zg=='], video_title: 'Bee', url: 'https://www.youtube.com/watch?v=abc123', time_range: { start, end }, captured_at: '2026-06-28T00:00:00Z' });

  test('hook then keyframe land in ONE note ordered 内容 before 动效', async () => {
    const { v, store } = vaultWithStore();
    await routeClip(hookPayload, manual, v);
    await routeClip(kfPayload(45, 52), manual, v);
    const paths = Object.keys(store);
    expect(paths.length).toBe(1);
    const note = store[paths[0]];
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('## ✨ 动效'));
    expect(note).toContain('dimensions: [内容, 动效]');
  });

  test('re-capturing hook returns a notice and does not duplicate', async () => {
    const { v, store } = vaultWithStore();
    await routeClip(hookPayload, manual, v);
    const r = await routeClip(hookPayload, manual, v);
    expect(r.notice).toContain('已存在');
    const note = store[Object.keys(store)[0]];
    expect((note.match(/## 🎬 内容/g) || []).length).toBe(1);
  });

  test('Xiaohongshu hook + keyframe merge into ONE note (link fallback embed)', async () => {
    const { v, store } = vaultWithStore();
    const url = 'https://www.xiaohongshu.com/explore/xhs123abc';
    await routeClip({ mode: 'hook', frames: ['Zg=='], video_title: 'XHS', url, captured_at: '2026-06-28T00:00:00Z' }, manual, v);
    await routeClip({ mode: 'keyframe', frames: ['Zg=='], video_title: 'XHS', url, time_range: { start: 5, end: 9 }, captured_at: '2026-06-28T00:00:00Z' }, manual, v);
    expect(Object.keys(store).length).toBe(1);
    const note = store[Object.keys(store)[0]];
    expect(note).toContain('platform: xiaohongshu');
    expect(note).toContain('video_id: "xhs123abc"');
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('## ✨ 动效'));
    expect(note).toContain('[▶ 跳转原视频]'); // no inline player for xhs
    expect(note).not.toContain('youtube.com/embed');
  });

  test('any platform merges by URL: Twitter hook + keyframe → one note', async () => {
    const { v, store } = vaultWithStore();
    await routeClip({ mode: 'hook', frames: ['Zg=='], video_title: 'Tweet', url: 'https://x.com/u/status/123?s=20', captured_at: '2026-06-28T00:00:00Z' }, manual, v);
    await routeClip({ mode: 'keyframe', frames: ['Zg=='], video_title: 'Tweet', url: 'https://x.com/u/status/123', time_range: { start: 5, end: 9 }, captured_at: '2026-06-28T00:00:00Z' }, manual, v);
    expect(Object.keys(store).length).toBe(1);
    const note = store[Object.keys(store)[0]];
    expect(note).toContain('video_id: "https://x.com/u/status/123"');
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('## ✨ 动效'));
  });

  test('hook with cover_url saves the gallery cover at <video_id>.webp', async () => {
    const { v } = vaultWithStore();
    await routeClip({ mode: 'hook', frames: ['Zg=='], video_title: 'Bee', url: 'https://www.youtube.com/watch?v=abc123', cover_url: 'https://img.youtube.com/vi/abc123/maxresdefault.jpg', captured_at: '2026-06-28T00:00:00Z' } as ClipPayload, manual, v);
    expect(v.createBinary).toHaveBeenCalledWith('Assets/Great Videos/abc123.webp', expect.any(ArrayBuffer));
  });

  test('cover is not re-downloaded when it already exists', async () => {
    const { v } = vaultWithStore();
    (v.fileExists as jest.Mock).mockReturnValue(true);
    await routeClip({ mode: 'hook', frames: ['Zg=='], video_title: 'Bee', url: 'https://www.youtube.com/watch?v=abc123', cover_url: 'https://x/cover.jpg', captured_at: '2026-06-28T00:00:00Z' } as ClipPayload, manual, v);
    expect(v.createBinary).not.toHaveBeenCalledWith('Assets/Great Videos/abc123.webp', expect.anything());
  });

  test('screenshot folds into the existing video note; otherwise standalone', async () => {
    const { v, store } = vaultWithStore();
    const url = 'https://www.youtube.com/watch?v=abc123';
    await routeClip(hookPayload, manual, v); // creates the video note
    await routeClip({ mode: 'screenshot', images: ['Zg=='], url, title: 'Bee' }, manual, v);
    expect(Object.keys(store).length).toBe(1); // merged, not a new note
    const note = store[Object.keys(store)[0]];
    expect(note).toContain('## 📸 截图');
    expect(note).toContain('dimensions: [内容, 截图]');

    // a screenshot on an un-studied plain webpage stays standalone
    await routeClip({ mode: 'screenshot', images: ['Zg=='], url: 'https://example.com/random', title: 'Rand' }, manual, v);
    expect(Object.keys(store).length).toBe(2);
  });

  test('two different videos with the same author+title get distinct filenames', async () => {
    const { v, store } = vaultWithStore();
    const base = { mode: 'hook' as const, frames: ['Zg=='], video_title: 'Same Title', channel: 'Ch', captured_at: '2026-06-28T00:00:00Z' };
    await routeClip({ ...base, url: 'https://www.youtube.com/watch?v=vid1' } as ClipPayload, manual, v);
    await routeClip({ ...base, url: 'https://www.youtube.com/watch?v=vid2' } as ClipPayload, manual, v);
    expect(Object.keys(store).length).toBe(2); // no overwrite / no crash
  });

  test('screenshot FIRST on a video page anchors the note (any order)', async () => {
    const { v, store } = vaultWithStore();
    const url = 'https://www.youtube.com/watch?v=zzz999';
    await routeClip({ mode: 'screenshot', images: ['Zg=='], url, title: 'Vid - YouTube' }, manual, v);
    await routeClip({ mode: 'hook', frames: ['Zg=='], video_title: 'Vid', url, captured_at: '2026-06-28T00:00:00Z' }, manual, v);
    expect(Object.keys(store).length).toBe(1); // screenshot anchored it, hook merged in
    const note = store[Object.keys(store)[0]];
    expect(note).toContain('## 📸 截图');
    expect(note).toContain('## 🎬 内容');
    expect(note.indexOf('## 🎬 内容')).toBeLessThan(note.indexOf('## 📸 截图'));
  });
});
