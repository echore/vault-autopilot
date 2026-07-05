import { DEFAULT_SETTINGS, normalizePort, emptyToDefault } from '../src/settings';

describe('port migration', () => {
  test('default port is 17183', () => {
    expect(DEFAULT_SETTINGS.httpServer.port).toBe(17183);
  });
  test('legacy default 27183 migrates to 17183', () => {
    expect(normalizePort(27183)).toBe(17183);
  });
  test('user-customized port is preserved', () => {
    expect(normalizePort(9999)).toBe(9999);
  });
  test('missing port falls back to default', () => {
    expect(normalizePort(undefined)).toBe(17183);
  });
});

describe('zero-config folder defaults', () => {
  test('all four modes have non-empty folder defaults under Clips/', () => {
    const { thumbnail, screenshot, hook, keyframe } = DEFAULT_SETTINGS.clipRules;
    expect(thumbnail.outputFolder).toBe('Clips/Videos');
    expect(thumbnail.thumbnailFolder).toBe('Clips/Videos/covers');
    expect(screenshot.outputFolder).toBe('Clips/Screenshots');
    expect(screenshot.framesFolder).toBe('Clips/Screenshots/frames');
    expect(hook.framesFolder).toBe('Clips/Videos/frames');
    expect(keyframe.framesFolder).toBe('Clips/Videos/frames');
  });
});

describe('emptyToDefault', () => {
  const def = { sopPath: '', outputFolder: 'Clips/Screenshots', framesFolder: 'Clips/Screenshots/frames' };
  test('empty string folder falls back to default', () => {
    expect(emptyToDefault({ outputFolder: '', framesFolder: '' }, def).outputFolder).toBe('Clips/Screenshots');
  });
  test('user value wins over default', () => {
    expect(emptyToDefault({ outputFolder: 'My/Notes' }, def).outputFolder).toBe('My/Notes');
  });
  test('sopPath may stay empty (material-only mode)', () => {
    expect(emptyToDefault({ sopPath: '' }, def).sopPath).toBe('');
  });
  test('undefined loaded returns defaults', () => {
    expect(emptyToDefault(undefined, def)).toEqual(def);
  });
});

describe('first-save notice flags', () => {
  test('first-save notice flags default to all-false', () => {
    expect(DEFAULT_SETTINGS.firstSaveNoticed).toEqual({
      thumbnail: false, screenshot: false, hook: false, keyframe: false,
    });
  });
});
