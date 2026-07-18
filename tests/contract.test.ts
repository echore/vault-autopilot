import { validateClipPayload } from '../src/clip-validate';
import { routeClip, VaultOps } from '../src/clip-router';

function mockVaultOps(): VaultOps {
  const files = new Map<string, string>();
  return {
    ensureFolder: async () => {},
    createBinary: async () => {},
    create: async (p, c) => { files.set(p, c); },
    readFileSync: () => { throw new Error('no sop'); },
    downloadUrl: async () => new ArrayBuffer(8),
    fileExists: () => false,
    listMarkdownFiles: () => [],
    read: async () => '',
    modify: async () => {},
    getFrontmatter: () => null,
  };
}

const RULES = {
  thumbnail: { sopPath: '', outputFolder: 'V', thumbnailFolder: 'V/covers' },
  screenshot: { sopPath: '', outputFolder: 'S', framesFolder: 'S/frames' },
  hook: { sopPath: '', outputFolder: 'V', maxFrames: 5, framesFolder: 'V/frames' },
  keyframe: { sopPath: '', outputFolder: 'V', maxFrames: 5, framesFolder: 'V/frames' },
} as any;

describe('extension -> backend contract', () => {
  test('legacy single-shot screenshot (image field) is accepted and routed', async () => {
    const raw = { mode: 'screenshot', image: 'YWJj', url: 'https://x.com', title: 'T', platform: 'other', captured_at: '2026-01-01T00:00:00Z' };
    const payload = validateClipPayload(raw);
    const r = await routeClip(payload, RULES, mockVaultOps());
    expect(r.notePath).toBeTruthy();
  });

  test('hook payload with null video_title is accepted and routed', async () => {
    const raw = { mode: 'hook', url: 'https://youtu.be/abc', title: 'T', platform: 'youtube', captured_at: '2026-01-01T00:00:00Z', frames: ['YWJj'], frames_select: 1, video_title: null, channel: null, time_range: { start: 0, end: 15 } };
    const payload = validateClipPayload(raw);
    const r = await routeClip(payload, RULES, mockVaultOps());
    expect(r.notePath).toBeTruthy();
  });
});
