import { postProcessMarkdown, sanitize, extractVideoId, buildVideoEmbed, safeFileId, assertDownloadable } from '../src/util';

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
  test('strips Obsidian-reserved chars [ ] # ^ common in video titles', () => {
    expect(sanitize('[Official Video] Song')).toBe('Official Video Song');
    expect(sanitize('C# tutorial')).toBe('C tutorial');
    expect(sanitize('Video [4K] ^best^')).toBe('Video 4K best');
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

describe('extractVideoId — Shorts and Live', () => {
  test('shorts, live, and watch URLs for the same id collapse to one key', () => {
    const id = 'dQw4w9WgXcQ';
    expect(extractVideoId(`https://www.youtube.com/shorts/${id}`, 'youtube')).toBe(id);
    expect(extractVideoId(`https://www.youtube.com/live/${id}`, 'youtube')).toBe(id);
    expect(extractVideoId(`https://www.youtube.com/watch?v=${id}`, 'youtube')).toBe(id);
  });
});

describe('assertDownloadable', () => {
  test('allows http and https on public CDN hosts', () => {
    expect(() => assertDownloadable('https://img.youtube.com/x.jpg')).not.toThrow();
    expect(() => assertDownloadable('https://i.ytimg.com/vi/x/hq.jpg')).not.toThrow();
    expect(() => assertDownloadable('http://i0.hdslb.com/bfs/archive/x.jpg')).not.toThrow();
  });
  test('rejects file: and data: and others', () => {
    expect(() => assertDownloadable('file:///etc/passwd')).toThrow();
    expect(() => assertDownloadable('data:text/html,x')).toThrow();
    expect(() => assertDownloadable('ftp://x/y')).toThrow();
  });
  // The /clip endpoint is CSRF-reachable, so thumbnail_url is attacker-influenced;
  // literal private/loopback/link-local hosts must never be fetched. (Hostnames
  // that merely RESOLVE to private IPs are accepted — DNS-rebinding protection
  // is deliberately out of scope for a desktop plugin.)
  test('rejects loopback and localhost literals', () => {
    expect(() => assertDownloadable('http://localhost/x.jpg')).toThrow();
    expect(() => assertDownloadable('http://127.0.0.1:8080/x')).toThrow();
    expect(() => assertDownloadable('http://127.8.9.10/x')).toThrow();
    expect(() => assertDownloadable('http://[::1]/x')).toThrow();
    expect(() => assertDownloadable('http://localhost./x')).toThrow(); // FQDN trailing dot
    expect(() => assertDownloadable('http://printer.local./x')).toThrow();
    expect(() => assertDownloadable('http://0x7f000001/x')).toThrow(); // URL-normalized to 127.0.0.1
    expect(() => assertDownloadable('http://[::ffff:127.0.0.1]/x')).toThrow();
  });
  test('rejects private and link-local ranges', () => {
    expect(() => assertDownloadable('http://10.1.2.3/x')).toThrow();
    expect(() => assertDownloadable('http://172.16.0.1/x')).toThrow();
    expect(() => assertDownloadable('http://172.31.255.255/x')).toThrow();
    expect(() => assertDownloadable('http://192.168.1.5/x')).toThrow();
    expect(() => assertDownloadable('http://169.254.169.254/latest/meta-data/')).toThrow();
    expect(() => assertDownloadable('http://0.0.0.0/x')).toThrow();
    expect(() => assertDownloadable('http://[fc00::1]/x')).toThrow();
    expect(() => assertDownloadable('http://[fe80::1]/x')).toThrow();
    expect(() => assertDownloadable('http://printer.local/x')).toThrow();
  });
  test('near-miss public addresses stay allowed', () => {
    expect(() => assertDownloadable('http://172.32.1.1/x')).not.toThrow();
    expect(() => assertDownloadable('http://11.0.0.1/x')).not.toThrow();
    expect(() => assertDownloadable('http://192.169.0.1/x')).not.toThrow();
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
