import { postProcessMarkdown, sanitize, extractVideoId, buildVideoEmbed, safeFileId } from '../src/util';

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

describe('extractVideoId', () => {
  test('extracts ID from youtu.be short URL', () => {
    expect(extractVideoId('https://youtu.be/MflKu9F4BsE?si=abc', 'youtube')).toBe('MflKu9F4BsE');
  });
  test('extracts ID from youtube.com/watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=MflKu9F4BsE', 'youtube')).toBe('MflKu9F4BsE');
  });
  test('extracts BV ID from Bilibili URL', () => {
    expect(extractVideoId('https://www.bilibili.com/video/BV1xx411c7XQ', 'bilibili')).toBe('BV1xx411c7XQ');
  });
  test('returns null for unknown platform', () => {
    expect(extractVideoId('https://example.com/video', 'other')).toBeNull();
  });
});

describe('buildVideoEmbed', () => {
  test('returns YouTube iframe with start time', () => {
    const result = buildVideoEmbed('https://youtu.be/MflKu9F4BsE?si=abc', 'youtube', 0);
    expect(result).toContain('<iframe');
    expect(result).toContain('youtube.com/embed/MflKu9F4BsE');
    expect(result).toContain('start=0');
  });
  test('returns YouTube iframe with non-zero start for keyframe', () => {
    const result = buildVideoEmbed('https://www.youtube.com/watch?v=MflKu9F4BsE', 'youtube', 30);
    expect(result).toContain('start=30');
  });
  test('returns Bilibili iframe', () => {
    const result = buildVideoEmbed('https://www.bilibili.com/video/BV1xx411c7XQ', 'bilibili', 15);
    expect(result).toContain('<iframe');
    expect(result).toContain('BV1xx411c7XQ');
    expect(result).toContain('t=15');
  });
  test('returns fallback link for unknown platform', () => {
    const result = buildVideoEmbed('https://example.com/video', 'other', 0);
    expect(result).toContain('https://example.com/video');
    expect(result).not.toContain('<iframe');
  });
});

describe('safeFileId', () => {
  test('keeps clean platform ids', () => {
    expect(safeFileId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    expect(safeFileId('BV1xx411c7mu')).toBe('BV1xx411c7mu');
  });
  test('strips path separators and traversal', () => {
    expect(safeFileId('../../etc/passwd')).toBe('etc-passwd');
    expect(safeFileId('a/b\\c')).toBe('a-b-c');
  });
  test('never returns empty', () => {
    expect(safeFileId('')).toBe('cover');
    expect(safeFileId('///')).toBe('cover');
  });
});

describe('buildVideoEmbed end param', () => {
  test('YouTube embed includes start and end when end given', () => {
    const out = buildVideoEmbed('https://www.youtube.com/watch?v=abc123', 'youtube', 10, 25);
    expect(out).toContain('youtube.com/embed/abc123?start=10&end=25');
  });
  test('YouTube embed omits end when not given', () => {
    const out = buildVideoEmbed('https://www.youtube.com/watch?v=abc123', 'youtube', 10);
    expect(out).toContain('start=10');
    expect(out).not.toContain('end=');
  });
});
