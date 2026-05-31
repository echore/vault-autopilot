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

const hookClipRule: ClipRule = { sopPath: '/hook-sop.md', outputFolder: 'Hooks', providerId: 'p1' };
const keyframeClipRule: ClipRule = { sopPath: '/kf-sop.md', outputFolder: 'Keyframes', providerId: 'p1' };
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
    const emptyRules = { hook: { sopPath: '', outputFolder: 'Hooks', providerId: 'p1' }, keyframe: keyframeClipRule };
    const payload: ClipPayload = {
      mode: 'hook', frames: [Buffer.from('f').toString('base64')],
      video_title: 'V', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z',
    };
    await expect(routeClip(payload, new Map(), emptyRules, [], vaultOps))
      .rejects.toThrow('not configured');
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
