import { routeClip, VaultOps } from '../src/clip-router';
import { AIProvider, ClipRule, WatchRule, isMultiFrameProvider } from '../src/types';
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
  };
}

const enabledWatchRule: WatchRule = {
  id: 'r1', enabled: true,
  watchFolder: 'Inbox', sopPath: '/sop.md',
  outputFolder: 'Notes', providerId: 'p1',
};

const hookClipRule: ClipRule = {
  sopPath: '/hook-sop.md', outputFolder: 'Hooks', providerId: 'p1',
  processingMode: 'auto', maxFrames: 5, framesFolder: 'Assets/images',
};
const keyframeClipRule: ClipRule = {
  sopPath: '/kf-sop.md', outputFolder: 'Keyframes', providerId: 'p1',
  processingMode: 'auto', maxFrames: 5, framesFolder: 'Assets/images',
};
const clipRules = { hook: hookClipRule, keyframe: keyframeClipRule };

// ── isMultiFrameProvider ──────────────────────────────────────────────────────

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
  test('saves new-format screenshot image and meta to watchRule folder', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'screenshot',
      image: Buffer.from('pixels').toString('base64'),
      url: 'https://x.com',
      title: 'My Screenshot',
    };
    await routeClip(payload, new Map(), clipRules, [enabledWatchRule], vaultOps);
    expect(vaultOps.createBinary).toHaveBeenCalledWith(
      expect.stringContaining('Inbox/'),
      expect.any(ArrayBuffer),
    );
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringContaining('.meta.json'),
      expect.stringContaining('"title":"My Screenshot"'),
    );
  });
});

// ── hook ──────────────────────────────────────────────────────────────────────

describe('routeClip — hook', () => {
  test('calls analyzeMultiFrame with decoded frames and transcript', async () => {
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
    await routeClip(payload, providers, clipRules, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      frames: [Buffer.from('frame1'), Buffer.from('frame2')],
      transcript: 'Hello world',
      sopContent: '# SOP\nAnalyze this.',
    }));
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Hooks\/hook-.+\.md/),
      expect.any(String),
    );
  });

  test('throws when hook clip rule has no sopPath configured', async () => {
    const vaultOps = makeVaultOps();
    const emptyRules = { hook: { sopPath: '', outputFolder: 'Hooks', providerId: 'p1', processingMode: 'auto' as const, maxFrames: 5, framesFolder: 'Assets/images' }, keyframe: keyframeClipRule };
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

  test('throws when frames array exceeds 20', async () => {
    const provider = makeMultiFrameProvider('p1');
    const providers = new Map<string, AIProvider>([['p1', provider as any]]);
    const vaultOps = makeVaultOps();
    const frames = Array(21).fill(Buffer.from('f').toString('base64'));
    const payload: ClipPayload = {
      mode: 'hook', frames, video_title: 'V',
      url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, providers, clipRules, [], vaultOps))
      .rejects.toThrow('Too many frames');
  });
});

// ── keyframe ──────────────────────────────────────────────────────────────────

describe('routeClip — keyframe', () => {
  test('calls analyzeMultiFrame without transcript and with time_range in meta', async () => {
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
    await routeClip(payload, providers, { hook: hookClipRule, keyframe: keyframeClipRule }, [enabledWatchRule], vaultOps);
    expect(provider.analyzeMultiFrame).toHaveBeenCalledWith(expect.objectContaining({
      transcript: undefined,
      meta: expect.objectContaining({ time_range: { start: 0, end: 15 } }),
    }));
    expect(vaultOps.create).toHaveBeenCalledWith(
      expect.stringMatching(/Keyframes\/keyframe-.+\.md/),
      expect.any(String),
    );
  });
});

// ── manual mode ───────────────────────────────────────────────────────────────

describe('routeClip — manual mode (hook)', () => {
  const manualHookRule: ClipRule = {
    sopPath: '', outputFolder: 'Hooks', providerId: '',
    processingMode: 'manual', maxFrames: 3, framesFolder: 'Assets/images',
  };
  const manualClipRules = { hook: manualHookRule, keyframe: keyframeClipRule };

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

  test('writes markdown template with frame embeds and jump link', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'hook',
      frames: [Buffer.from('f1').toString('base64'), Buffer.from('f2').toString('base64')],
      video_title: 'My Hook', transcript: 'Hello world',
      url: 'https://youtube.com/watch?v=abc', captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, new Map(), manualClipRules, [], vaultOps);
    const [notePath, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(notePath).toMatch(/Hooks\/hook-.+\.md/);
    expect(noteContent).toContain('# Hook — My Hook');
    expect(noteContent).toContain('<iframe');
    expect(noteContent).toContain('youtube.com/embed/');
    expect(noteContent).toContain('[Image #1]');
    expect(noteContent).toContain('![[');
    expect(noteContent).toContain('Hello world');
    expect(noteContent).toContain('## Hook 类型');
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
  const manualClipRules = { hook: hookClipRule, keyframe: manualKeyframeRule };

  test('writes keyframe template with time range in title and jump link', async () => {
    const vaultOps = makeVaultOps();
    const payload: ClipPayload = {
      mode: 'keyframe',
      frames: [Buffer.from('f1').toString('base64')],
      video_title: 'My Video', url: 'https://youtube.com/watch?v=xyz',
      time_range: { start: 30, end: 45 }, captured_at: '2026-05-30T18:00:00Z',
    };
    await routeClip(payload, new Map(), manualClipRules, [], vaultOps);
    const [, noteContent] = (vaultOps.create as jest.Mock).mock.calls[0];
    expect(noteContent).toContain('# 关键帧 — My Video [30s–45s]');
    expect(noteContent).toContain('<iframe');
    expect(noteContent).toContain('start=30');
    expect(noteContent).toContain('## 技法类型');
  });
});
