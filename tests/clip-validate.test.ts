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
});
