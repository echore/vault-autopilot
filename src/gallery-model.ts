// Pure data layer for the video library gallery view: chip derivation,
// filtering, and sort order. The ItemView renders whatever this returns.
// Dimensions are stored normalized (section kinds where recognizable), so the
// view can render them in the current UI language.

export interface GalleryCard {
  path: string;
  title: string;
  videoId: string;
  platform?: string;
  channel?: string;
  dimensions: string[];
  depth?: string;
  views?: string;
  note?: string;
  // ISO date string used for sorting (analyzed_at, or file ctime fallback).
  date?: string;
  // Video publish date, display-only; sorting stays on `date`.
  published?: string;
}

export function displayDate(card: GalleryCard): string {
  return card.published ?? card.date ?? '';
}

export interface GalleryFilter {
  // Dimension chips are OR-combined among themselves.
  dims: string[];
  // One platform at a time, or null (all platforms).
  platform: string | null;
  // One source at a time: DEEP_SOURCE, a channel name, or null (all).
  source: string | null;
}

export const EMPTY_FILTER: GalleryFilter = { dims: [], platform: null, source: null };

export const DEEP_SOURCE = '__deep__';

// Channel chips only appear for creators with enough videos to be worth a
// filter; below the threshold the "All" view is already scannable.
export const CHANNEL_CHIP_MIN = 6;

export function dimensionChips(cards: GalleryCard[]): string[] {
  const seen: string[] = [];
  for (const c of cards)
    for (const d of c.dimensions)
      if (!seen.includes(d)) seen.push(d);
  return seen;
}

export function platformChips(cards: GalleryCard[]): string[] {
  const seen: string[] = [];
  for (const c of cards)
    if (c.platform && !seen.includes(c.platform)) seen.push(c.platform);
  // A platform chip only helps once there is more than one platform.
  return seen.length > 1 ? seen : [];
}

export function channelChips(cards: GalleryCard[], min = CHANNEL_CHIP_MIN): string[] {
  const counts = new Map<string, number>();
  for (const c of cards)
    if (c.channel) counts.set(c.channel, (counts.get(c.channel) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1])
    .map(([ch]) => ch);
}

export function hasDeep(cards: GalleryCard[]): boolean {
  return cards.some(c => c.depth === 'deep');
}

export function filterCards(cards: GalleryCard[], filter: GalleryFilter): GalleryCard[] {
  return cards
    .filter(c => {
      if (filter.platform && c.platform !== filter.platform) return false;
      if (filter.source === DEEP_SOURCE && c.depth !== 'deep') return false;
      if (filter.source && filter.source !== DEEP_SOURCE && c.channel !== filter.source) return false;
      if (filter.dims.length > 0 && !filter.dims.some(d => c.dimensions.includes(d))) return false;
      return true;
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
}
