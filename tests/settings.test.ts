import { DEFAULT_SETTINGS, normalizePort, emptyToDefault, deriveFolders, applyBaseFolder } from '../src/settings';

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

test('default language is English', () => {
  expect(DEFAULT_SETTINGS.language).toBe('en');
});

describe('base folder derivation', () => {
  test('default settings carry baseFolder Clips', () => {
    expect(DEFAULT_SETTINGS.baseFolder).toBe('Clips');
  });
  test('derives all five paths from a base name', () => {
    expect(deriveFolders('Great Videos')).toEqual({
      videoNotes: 'Great Videos/Videos',
      covers: 'Great Videos/Videos/covers',
      frames: 'Great Videos/Videos/frames',
      screenshots: 'Great Videos/Screenshots',
      screenshotFrames: 'Great Videos/Screenshots/frames',
    });
  });
  test('trims whitespace and trailing slashes; empty falls back to Clips', () => {
    expect(deriveFolders(' class// ').videoNotes).toBe('class/Videos');
    expect(deriveFolders('').videoNotes).toBe('Clips/Videos');
  });
  test('applyBaseFolder rewrites every folder field and baseFolder itself', () => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    applyBaseFolder(s, 'class');
    expect(s.baseFolder).toBe('class');
    expect(s.clipRules.thumbnail.outputFolder).toBe('class/Videos');
    expect(s.clipRules.thumbnail.thumbnailFolder).toBe('class/Videos/covers');
    expect(s.clipRules.hook.framesFolder).toBe('class/Videos/frames');
    expect(s.clipRules.keyframe.framesFolder).toBe('class/Videos/frames');
    expect(s.clipRules.screenshot.outputFolder).toBe('class/Screenshots');
    expect(s.clipRules.screenshot.framesFolder).toBe('class/Screenshots/frames');
  });
  test('applyBaseFolder with Clips restores the factory layout', () => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    applyBaseFolder(s, 'somewhere/else');
    applyBaseFolder(s, 'Clips');
    expect(s.clipRules).toEqual(DEFAULT_SETTINGS.clipRules);
  });
  test('applyBaseFolder never touches sopPath', () => {
    const s = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    s.clipRules.hook.sopPath = '/keep/me.md';
    applyBaseFolder(s, 'class');
    expect(s.clipRules.hook.sopPath).toBe('/keep/me.md');
  });
});
