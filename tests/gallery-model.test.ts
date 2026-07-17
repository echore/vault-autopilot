import {
  GalleryCard, dimensionChips, platformChips, channelChips, hasDeep, filterCards, displayDate,
  DEEP_SOURCE, EMPTY_FILTER,
} from '../src/gallery-model';

const card = (over: Partial<GalleryCard>): GalleryCard => ({
  path: 'Clips/Videos/x.md', title: 'x', videoId: 'x', dimensions: [], ...over,
});

describe('dimensionChips', () => {
  test('collects distinct dimensions in first-seen order', () => {
    const cards = [
      card({ dimensions: ['cover', 'content'] }),
      card({ dimensions: ['content', 'motion'] }),
    ];
    expect(dimensionChips(cards)).toEqual(['cover', 'content', 'motion']);
  });
  test('empty library yields no chips', () => {
    expect(dimensionChips([])).toEqual([]);
  });
});

describe('platformChips', () => {
  test('a single platform shows no chip; two or more show all', () => {
    expect(platformChips([card({ platform: 'youtube' })])).toEqual([]);
    expect(platformChips([card({ platform: 'youtube' }), card({ platform: 'bilibili' })]))
      .toEqual(['youtube', 'bilibili']);
  });
});

describe('channelChips', () => {
  test('only creators at or above the threshold get a chip, busiest first', () => {
    const cards = [
      ...Array.from({ length: 7 }, () => card({ channel: 'Ali' })),
      ...Array.from({ length: 9 }, () => card({ channel: 'MKBHD' })),
      ...Array.from({ length: 2 }, () => card({ channel: 'Rare' })),
    ];
    expect(channelChips(cards)).toEqual(['MKBHD', 'Ali']);
  });
  test('cards without channel are ignored', () => {
    expect(channelChips([card({}), card({})], 1)).toEqual([]);
  });
});

describe('hasDeep', () => {
  test('true only when some card is depth deep', () => {
    expect(hasDeep([card({ depth: 'normal' })])).toBe(false);
    expect(hasDeep([card({ depth: 'normal' }), card({ depth: 'deep' })])).toBe(true);
  });
});

describe('filterCards', () => {
  const lib = [
    card({ path: 'a', dimensions: ['content'], channel: 'Ali', platform: 'youtube', date: '2026-07-01' }),
    card({ path: 'b', dimensions: ['motion'], channel: 'MKBHD', platform: 'youtube', date: '2026-07-10', depth: 'deep' }),
    card({ path: 'c', dimensions: ['content', 'motion'], channel: 'Ali', platform: 'bilibili', date: '2026-06-20' }),
    card({ path: 'd', dimensions: [], channel: 'Ali', platform: 'youtube' }),
  ];

  test('no filter returns everything, newest first, undated last', () => {
    expect(filterCards(lib, EMPTY_FILTER).map(c => c.path)).toEqual(['b', 'a', 'c', 'd']);
  });
  test('dimension chips OR-combine', () => {
    expect(filterCards(lib, { ...EMPTY_FILTER, dims: ['content', 'motion'] }).map(c => c.path))
      .toEqual(['b', 'a', 'c']);
  });
  test('channel source ANDs with dimensions', () => {
    expect(filterCards(lib, { ...EMPTY_FILTER, dims: ['content'], source: 'Ali' }).map(c => c.path))
      .toEqual(['a', 'c']);
  });
  test('platform ANDs with everything else', () => {
    expect(filterCards(lib, { ...EMPTY_FILTER, platform: 'bilibili' }).map(c => c.path)).toEqual(['c']);
    expect(filterCards(lib, { ...EMPTY_FILTER, platform: 'youtube', source: 'Ali' }).map(c => c.path))
      .toEqual(['a', 'd']);
  });
  test('deep source keeps only deep cards', () => {
    expect(filterCards(lib, { ...EMPTY_FILTER, source: DEEP_SOURCE }).map(c => c.path)).toEqual(['b']);
  });
  test('does not mutate the input order', () => {
    const before = lib.map(c => c.path);
    filterCards(lib, EMPTY_FILTER);
    expect(lib.map(c => c.path)).toEqual(before);
  });
});

describe('displayDate', () => {
  const base = { path: 'p.md', title: 't', videoId: 'v', dimensions: [] as string[] };

  test('prefers published over clip date', () => {
    expect(displayDate({ ...base, published: '2026-07-10', date: '2026-07-16' })).toBe('2026-07-10');
  });

  test('falls back to clip date, then empty string', () => {
    expect(displayDate({ ...base, date: '2026-07-16' })).toBe('2026-07-16');
    expect(displayDate(base)).toBe('');
  });
});
