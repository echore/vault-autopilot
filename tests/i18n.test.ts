import { t, setLanguage, variants } from '../src/i18n';
import en from '../src/locales/en.json';
import zh from '../src/locales/zh.json';

afterEach(() => setLanguage('en'));

test('en and zh have identical key sets', () => {
  expect(Object.keys(zh).sort()).toEqual(Object.keys(en).sort());
});

test('t returns English by default', () => {
  expect(t('settings.storageHeading')).toBe('Storage locations');
});

test('t returns Chinese after setLanguage', () => {
  setLanguage('zh');
  expect(t('settings.storageHeading')).toBe('存储位置');
});

test('t interpolates {vars}', () => {
  expect(t('notice.savedTo', { folder: 'Clips/Videos' })).toContain('Clips/Videos');
  expect(t('notice.savedTo', { folder: 'Clips/Videos' })).not.toContain('{folder}');
});

test('variants returns the value from every language', () => {
  expect(variants('note.heading.cover').sort()).toEqual(['Cover & Title', '封面标题'].sort());
});

test('heading labels contain no regex metacharacters', () => {
  // renumber() builds a RegExp from these labels — keep them literal.
  const headingKeys = ['note.heading.cover', 'note.heading.content', 'note.heading.motion', 'note.heading.screenshot'] as const;
  for (const key of headingKeys) {
    for (const label of variants(key)) {
      expect(label).not.toMatch(/[\\^$.*+?()[\]{}|]/);
    }
  }
});
