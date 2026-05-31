import { postProcessMarkdown, sanitize } from '../src/util';

describe('postProcessMarkdown', () => {
  test('wraps bare 6-digit hex codes in backticks', () => {
    expect(postProcessMarkdown('color is #ff0000 here')).toBe('color is `#ff0000` here');
  });
  test('wraps bare 3-digit hex codes in backticks', () => {
    expect(postProcessMarkdown('color #fff')).toBe('color `#fff`');
  });
  test('does not double-wrap already backtick-wrapped codes', () => {
    expect(postProcessMarkdown('color is `#ff0000` here')).toBe('color is `#ff0000` here');
  });
  test('does not wrap non-hex hash tags', () => {
    expect(postProcessMarkdown('see #tag here')).toBe('see #tag here');
  });
});

describe('sanitize', () => {
  test('removes forbidden filename characters', () => {
    expect(sanitize('file/name:bad*char')).toBe('file name bad char');
  });
  test('collapses multiple spaces into one', () => {
    expect(sanitize('a   b')).toBe('a b');
  });
  test('trims to 60 characters', () => {
    expect(sanitize('a'.repeat(70))).toHaveLength(60);
  });
  test('returns empty string for empty input', () => {
    expect(sanitize('')).toBe('');
  });
  test('returns empty string for undefined input', () => {
    expect(sanitize(undefined as any)).toBe('');
  });
});
