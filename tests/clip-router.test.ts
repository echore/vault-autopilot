import { routeClip, VaultOps } from '../src/clip-router';
import { AIProvider, ClipRule, ScreenshotClipRule, ThumbnailClipRule, WatchRule, isMultiFrameProvider } from '../src/types';
import { ClipPayload } from '../src/server';

function makeMultiFrameProvider(id = 'p1') {
  return {
    id,
    name: 'Mock API Provider',
    analyze: jest.fn(),
    analyzeMultiFrame: jest.fn().mockResolvedValue('# Analysis\nContent'),
  };
}

function makeSingleProvider(id = 'p2') {
  return { id, name: 'Mock CLI', analyze: jest.fn() };
}

function makeVaultOps(): jest.Mocked<VaultOps> {
  return {
    ensureFolder: jest.fn().mockResolvedValue(undefined),
    createBinary: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    readFileSync: jest.fn().mockReturnValue('# SOP\nAnalyze this.'),
    downloadUrl: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    listMarkdownFiles: jest.fn().mockReturnValue([]),
    read: jest.fn().mockResolvedValue(''),
    modify: jest.fn().mockResolvedValue(undefined),
  };
}

const enabledWatchRule: WatchRule = {
  id: 'r1', enabled: true,
  watchFolder: 'Inbox', sopPath: '/sop.md',
  outputFolder: 'Notes', providerId: 'p1',
};

const thumbnailClipRule: ThumbnailClipRule = {
  sopPath: '/thumb-sop.md', outputFolder: 'Content Creation/Great Videos',
  thumbnailFolder: 'Assets/Great Videos', providerId: 'p1', processingMode: 'manual',
};
const screenshotClipRule: ScreenshotClipRule = {
  sopPath: '/ss-sop.md', outputFolder: 'Screenshots', providerId: 'p1',
  processingMode: 'manual', framesFolder: 'Assets/images',
};
const hookClipRule: ClipRule = {
  sopPath: '/hook-sop.md', outputFolder: 'Hooks', providerId: 'p1',
  processingMode: 'auto', maxFrames: 5, framesFolder: 'Assets/images',
};
const keyframeClipRule: ClipRule = {
  sopPath: '/kf-sop.md', outputFolder: 'Keyframes', providerId: 'p1',
  processingMode: 'auto', maxFrames: 5, framesFolder: 'Assets/images',
};
const clipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook: hookClipRule, keyframe: keyframeClipRule };

// ── isMultiFrameProvider ──────────────────────────────────────────────────────

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
    await routeClip(payload, new Map(), clipRules, [], vaultOps);
    expect(vaultOps.downloadUrl).toHaveBeenCalledWith(payload.thumbnail_url);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      'Assets/Great Videos/abc123.jpg',
      expect.any(ArrayBuffer),
    );
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(notePath).toBe('Content Creation/Great Videos/Ali Abdaal - How to Get Rich on Easy Mode.md');
    expect(noteContent).toContain('type: video');
    expect(noteContent).toContain('video_id: "abc123"');
    expect(noteContent).toContain('channel: "Ali Abdaal"');
    expect(noteContent).toContain('dimensions: [封面标题]');
    expect(noteContent).toContain('![[abc123.jpg]]');
    expect(noteContent).toContain('## 封面标题');
  });

  test('note filename omits the author segment when channel is empty', async () => {
    const vaultOps = makeVaultOps();
    const noChannel = { ...payload, channel: '' } as ClipPayload;
    const result = await routeClip(noChannel, new Map(), clipRules, [], vaultOps);
    expect(result.notePath).toBe('Content Creation/Great Videos/How to Get Rich on Easy Mode.md');
  });

  test('auto: calls analyzeMultiFrame with thumbnail buffer and writes AI result', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const autoRule: ThumbnailClipRule = { ...thumbnailClipRule, processingMode: 'auto' };
    await routeClip(payload, providers, { ...clipRules, thumbnail: autoRule }, [], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      sopContent: '# SOP\nAnalyze this.',
      meta: expect.objectContaining({ video_title: 'How to Get Rich on Easy Mode' }),
    }));
    const [, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(noteContent).toContain('## 封面标题');
    expect(noteContent).toContain('# Analysis');
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
    await routeClip(generic, new Map(), clipRules, [], vaultOps);
    const [, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(noteContent).not.toContain('youtube.com/embed');
    expect(noteContent).not.toContain('channel: "');
    expect(noteContent).toContain('![[twitter-com-i-status-123.jpg]]');
    expect(noteContent).toContain('## 封面标题');
  });
});

describe('isMultiFrameProvider', () => {
  test('returns true when analyzeMultiFrame method is present', () => {
    expect(isMultiFrameProvider(makeMultiFrameProvider())).toBe(true);
  });
  test('returns false when analyzeMultiFrame is absent', () => {
    expect(isMultiFrameProvider(makeSingleProvider())).toBe(false);
  });
});

// ── legacy format ─────────────────────────────────────────────────────────────

describe('routeClip — legacy format', () => {
  test('saves image and meta.json to first enabled watchRule folder', async () => {
    const vaultOps = makeVaultOps();
    const payload = { image_base64: Buffer.from('frame').toString('base64'), source_url: 'https://x.com', title: 'Test' };
    await routeClip(payload as ClipPayload, new Map(), clipRules, [enabledWatchRule], vaultOps);
    expect(vaultOps.ensureFolder).toHaveBeenCalledWith('Inbox');
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Inbox/'),
      expect.any(ArrayBuffer),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('.meta.json'),
      expect.stringContaining('"source_url":"https://x.com"'),
    );
  });

  test('throws when no enabled watch rules exist', async () => {
    const vaultOps = makeVaultOps();
    const payload = { image_base64: 'AAAA', source_url: '', title: '' };
    await expect(routeClip(payload as ClipPayload, new Map(), clipRules, [], vaultOps))
      .rejects.toThrow('No enabled watch rules');
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
    const result = await routeClip(payload, new Map(), clipRules, [], vaultOps);
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

  test('auto: saves images then calls analyzeMultiFrame', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const autoRule: ScreenshotClipRule = { ...screenshotClipRule, processingMode: 'auto' };
    const payload: ClipPayload = {
      mode: 'screenshot',
      images: [Buffer.from('pixels').toString('base64')],
      url: 'https://x.com',
      title: 'Auto Shot',
    };
    await routeClip(payload, providers, { ...clipRules, screenshot: autoRule }, [], vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Assets/images/'),
      expect.any(ArrayBuffer),
    );
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      frames: [Buffer.from('pixels')],
      sopContent: '# SOP\nAnalyze this.',
    }));
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Screenshots\/screenshot-.+\.md/),
      expect.any(String),
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
    await routeClip(payload, new Map(), clipRules, [], vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledTimes(1);
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Screenshots\/screenshot-.+\.md/),
      expect.stringContaining('# Screenshot — Old Format'),
    );
  });
});

// ── hook ──────────────────────────────────────────────────────────────────────

describe('routeClip — hook', () => {
  test('calls analyzeMultiFrame with decoded frames and transcript, creates note in Great Videos', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('frame1').toString('base64'), Buffer.from('frame2').toString('base64')],
      transcript: 'Hello world',
      video_title: 'My Hook',
      url: 'https://yt.com',
      captured_at: '2026-05-30T18:00:00Z',
    };
    const result = await routeClip(payload, providers, clipRules, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      frames: [Buffer.from('frame1'), Buffer.from('frame2')],
      transcript: 'Hello world',
      sopContent: '# SOP\nAnalyze this.',
    }));
    // Hook now lands in the Great Videos (thumbnail outputFolder) as a merged note
    expect(result.notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Content Creation\/Great Videos\/.+\.md/),
      expect.stringContaining('## 内容'),
    );
  });

  test('throws when hook clip rule has no sopPath configured', async () => {
    const vaultOps = makeVaultOps();
    const emptyRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:{ sopPath: '', outputFolder: 'Hooks', providerId: 'p1', processingMode: 'auto' as const, maxFrames: 5, framesFolder: 'Assets/images' }, keyframe: keyframeClipRule };
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, new Map(), emptyRules, [], vaultOps))
      .rejects.toThrow('not configured');
  });

  test('throws when provider id is not found in providers map', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    // clipRules.hook.providerId is 'p1' but the map is empty
    await expect(routeClip(payload, new Map(), clipRules, [], vaultOps))
      .rejects.toThrow('not found');
  });

  test('throws when provider does not support multi-frame', async () => {
    const singleProvider = makeSingleProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', singleProvider]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, providers, clipRules, [], vaultOps))
      .rejects.toThrow('does not support multi-frame');
  });

  test('21 raw frames are sampled down to maxFrames before AI call', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const frames = Array(21).fill(Buffer.from('f').toString('base64'));
    const payload: ClipPayload = {
      mode: 'hook', frames, video_title: 'V',
      url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, providers, clipRules, [], vaultOps);
    const { frames: sentFrames } = (provider.analyzeMultiFrame as jest.Mock).mock.calls[0][0];
    expect(sentFrames.length).toBeLessThanOrEqual(hookClipRule.maxFrames);
  });
});

// ── keyframe ──────────────────────────────────────────────────────────────────

describe('routeClip — keyframe', () => {
  test('calls analyzeMultiFrame without transcript and with time_range in meta, creates note in Great Videos', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://yt.com',
      time_range: { start: 0, end: 15 },
      captured_at: '2026-05-30T18:00:00Z',
    };
    const result = await routeClip(payload, providers, { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:hookClipRule, keyframe: keyframeClipRule }, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      transcript: undefined,
      meta: expect.objectContaining({ time_range: { start: 0, end: 15 } }),
    }));
    // Keyframe now lands in the Great Videos (thumbnail outputFolder) as a merged note
    expect(result.notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Content Creation\/Great Videos\/.+\.md/),
      expect.stringContaining('## 动效'),
    );
  });
});

// ── manual mode ───────────────────────────────────────────────────────────────

describe('routeClip — manual mode (hook)', () => {
  const manualHookRule: ClipRule = {
    sopPath: '', outputFolder: 'Hooks', providerId: '',
    processingMode: 'manual', maxFrames: 3, framesFolder: 'Assets/images',
  };
  const manualClipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:manualHookRule, keyframe: keyframeClipRule };

  test('saves sampled frames as PNG files', async () => {
    const vaultOps = makeVaultOps();
    const frames = Array.from({ length: 6 }, (_, i) => Buffer.from(`frame${i}`).toString('base64'));
    const payload: ClipPayload = {
      mode: 'hook', frames, video_title: 'Test Hook',
      url: 'https://youtube.com/watch?v=abc', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, new Map(), manualClipRules, [], vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledTimes(3);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringMatching(/Assets\/images\/hook-.+-f01\.png/),
      expect.any(ArrayBuffer),
    );
  });

  test('writes merged note in Great Videos with ## 内容 section, frame embeds, transcript', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64'), Buffer.from('f2').toString('base64')],
      video_title: 'My Hook', transcript: 'Hello world',
      url: 'https://youtube.com/watch?v=abc', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, new Map(), manualClipRules, [], vaultOps);
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    // Hook now goes into the Great Videos (thumbnail outputFolder) as a merged note
    expect(notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(noteContent).toContain('## 内容');
    expect(noteContent).toContain('<iframe');
    expect(noteContent).toContain('youtube.com/embed/');
    expect(noteContent).toContain('[Image #1]');
    expect(noteContent).toContain('![[');
    expect(noteContent).toContain('Hello world');
  });

  test('does not call analyzeMultiFrame in manual mode', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, providers, manualClipRules, [], vaultOps);
    expect(provider.analyzeMultiFrame).not.toHaveBeenCalled();
  });
});

describe('routeClip — manual mode (keyframe)', () => {
  const manualKeyframeRule: ClipRule = {
    sopPath: '', outputFolder: 'Keyframes', providerId: '',
    processingMode: 'manual', maxFrames: 5, framesFolder: 'Assets/images',
  };
  const manualClipRules = { thumbnail: thumbnailClipRule, screenshot: screenshotClipRule, hook:hookClipRule, keyframe: manualKeyframeRule };

  test('writes merged note in Great Videos with ## 动效 section, time range embed', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video', url: 'https://youtube.com/watch?v=xyz',
      time_range: { start: 30, end: 45 }, captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, new Map(), manualClipRules, [], vaultOps);
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    // Keyframe now goes into Great Videos as a merged note
    expect(notePath).toMatch(/Content Creation\/Great Videos\/.+\.md/);
    expect(noteContent).toContain('## 动效');
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
    `## 封面标题`,
    `分析内容`,
  ].join('\n');

  test('hook: finds existing note by video_id and appends ## 内容 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualHookRule = { ...hookClipRule, processingMode: 'manual' as const, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, new Map(), { ...clipRules, hook: manualHookRule }, [], vaultOps);
    expect(vaultOps.modify).toHaveBeenCalledWith(
      'Content Creation/Great Videos/note.md',
      expect.stringContaining('## 内容'),
    );
    const [, modifiedContent] = (vaultOps.modify as jest.Mock).mock.calls[0];
    expect(modifiedContent).toContain('dimensions: [封面标题, 内容]');
    expect(modifiedContent).toContain('[Image #1]');
    expect(vaultOps.create).not.toHaveBeenCalled();
  });

  test('keyframe: finds existing note and appends ## 动效 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualKeyframeRule = { ...keyframeClipRule, processingMode: 'manual' as const, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      time_range: { start: 10, end: 20 },
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, new Map(), { ...clipRules, keyframe: manualKeyframeRule }, [], vaultOps);
    const [, modifiedContent] = (vaultOps.modify as jest.Mock).mock.calls[0];
    expect(modifiedContent).toContain('## 动效');
    expect(modifiedContent).toContain('dimensions: [封面标题, 动效]');
  });

  test('append returns the existing note path (for obsidian deep link)', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue(['Content Creation/Great Videos/note.md']);
    (vaultOps.read as jest.Mock).mockResolvedValue(existingNote);
    const manualHookRule = { ...hookClipRule, processingMode: 'manual' as const, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video',
      url: 'https://www.youtube.com/watch?v=abc123',
      captured_at: '2026-05-31T00:00:00Z',
    };
    const result = await routeClip(payload, new Map(), { ...clipRules, hook: manualHookRule }, [], vaultOps);
    expect(result.notePath).toBe('Content Creation/Great Videos/note.md');
  });

  test('no existing note: creates new note in Great Videos with ## 内容 section', async () => {
    const vaultOps = makeVaultOps();
    (vaultOps.listMarkdownFiles as jest.Mock).mockReturnValue([]);
    const manualHookRule = { ...hookClipRule, processingMode: 'manual' as const, sopPath: '' };
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'New Video',
      url: 'https://www.youtube.com/watch?v=newvid',
      captured_at: '2026-05-31T00:00:00Z',
    };
    await routeClip(payload, new Map(), { ...clipRules, hook: manualHookRule }, [], vaultOps);
    expect(vaultOps.modify).not.toHaveBeenCalled();
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('Content Creation/Great Videos/'),
      expect.stringContaining('## 内容'),
    );
  });
});

// ── unified video note (manual) ───────────────────────────────────────────────

describe('routeClip — unified video note (manual)', () => {
  const manual = {
    thumbnail: { ...thumbnailClipRule },
    screenshot: screenshotClipRule,
    hook: { ...hookClipRule, processingMode: 'manual' as const, sopPath: '' },
    keyframe: { ...keyframeClipRule, processingMode: 'manual' as const, sopPath: '' },
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
    await routeClip(hookPayload, new Map(), manual, [], v);
    await routeClip(kfPayload(45, 52), new Map(), manual, [], v);
    const paths = Object.keys(store);
    expect(paths.length).toBe(1);
    const note = store[paths[0]];
    expect(note.indexOf('## 内容')).toBeLessThan(note.indexOf('## 动效'));
    expect(note).toContain('dimensions: [内容, 动效]');
  });

  test('re-capturing hook returns a notice and does not duplicate', async () => {
    const { v, store } = vaultWithStore();
    await routeClip(hookPayload, new Map(), manual, [], v);
    const r = await routeClip(hookPayload, new Map(), manual, [], v);
    expect(r.notice).toContain('已存在');
    const note = store[Object.keys(store)[0]];
    expect((note.match(/## 内容/g) || []).length).toBe(1);
  });
});
