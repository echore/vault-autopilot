import { validateClipPayload, ClipValidationError } from '../src/clip-validate';

describe('validateClipPayload', () => {
  test('accepts a screenshot with images[]', () => {
    const p = validateClipPayload({ mode: 'screenshot', images: ['abc'], url: 'https://x.com', title: 'T' });
    expect(p.mode).toBe('screenshot');
  });
  test('normalizes legacy image -> images[]', () => {
    const p: any = validateClipPayload({ mode: 'screenshot', image: 'abc', url: 'https://x.com', title: 'T' });
    expect(p.images).toEqual(['abc']);
  });
  test('accepts null video_title on a hook', () => {
    const p: any = validateClipPayload({
      mode: 'hook', frames: ['x'], url: 'https://y.com', captured_at: '2026-01-01T00:00:00Z', video_title: null,
    });
    expect(p.video_title).toBeNull();
  });
  test('rejects unknown mode', () => {
    expect(() => validateClipPayload({ mode: 'evil' })).toThrow(ClipValidationError);
  });
  test('rejects non-object', () => {
    expect(() => validateClipPayload('not json')).toThrow(ClipValidationError);
  });
  test('rejects a screenshot with no images and no image', () => {
    expect(() => validateClipPayload({ mode: 'screenshot', url: 'x', title: 'T' })).toThrow(ClipValidationError);
  });

  // Type gate only — no format tightening. The extension's real payloads
  // (see contract.test.ts) must all keep passing.
  describe('optional field types', () => {
    const thumb = { mode: 'thumbnail', video_id: 'a', thumbnail_url: 'https://t/x', video_url: 'https://v/x' };
    test('rejects non-string platform / published_at / channel / title on thumbnail', () => {
      expect(() => validateClipPayload({ ...thumb, platform: 123 })).toThrow(ClipValidationError);
      expect(() => validateClipPayload({ ...thumb, published_at: {} })).toThrow(ClipValidationError);
      expect(() => validateClipPayload({ ...thumb, channel: ['x'] })).toThrow(ClipValidationError);
      expect(() => validateClipPayload({ ...thumb, title: 42 })).toThrow(ClipValidationError);
    });
    test('rejects non-string transcript / channel on hook', () => {
      const hook = { mode: 'hook', frames: ['x'], url: 'https://y.com' };
      expect(() => validateClipPayload({ ...hook, transcript: 42 })).toThrow(ClipValidationError);
      expect(() => validateClipPayload({ ...hook, channel: {} })).toThrow(ClipValidationError);
    });
    test('absent and null optional fields still pass', () => {
      expect(() => validateClipPayload(thumb)).not.toThrow();
      expect(() => validateClipPayload({ ...thumb, channel: null, published_at: null })).not.toThrow();
      expect(() => validateClipPayload({ mode: 'hook', frames: ['x'], url: 'https://y.com', video_title: null, channel: null })).not.toThrow();
    });
  });
});
