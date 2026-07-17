import { ItemView, WorkspaceLeaf } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { t } from './i18n';
import { labelToKind, headingLabel, SectionKind } from './video-note';
import {
  GalleryCard, GalleryFilter, EMPTY_FILTER, DEEP_SOURCE,
  dimensionChips, platformChips, channelChips, hasDeep, filterCards,
} from './gallery-model';

export const GALLERY_VIEW_TYPE = 'vault-autopilot-gallery';

const PLATFORM_LABELS: Record<string, string> = { youtube: 'YouTube', bilibili: 'Bilibili' };

export class GalleryView extends ItemView {
  private filter: GalleryFilter = { ...EMPTY_FILTER, dims: [] };

  constructor(leaf: WorkspaceLeaf, private plugin: VaultAutopilotPlugin) {
    super(leaf);
  }

  getViewType(): string { return GALLERY_VIEW_TYPE; }
  getDisplayText(): string { return t('gallery.title'); }
  getIcon(): string { return 'layout-grid'; }

  async onOpen(): Promise<void> {
    // Frontmatter changes (new clips, edits) refresh the gallery while open.
    this.registerEvent(this.app.metadataCache.on('resolved', () => this.render()));
    this.render();
  }

  private collectCards(): GalleryCard[] {
    const folder = this.plugin.settings.clipRules.thumbnail.outputFolder;
    const cards: GalleryCard[] = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!file.path.startsWith(`${folder}/`)) continue;
      const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
      if (!fm || fm.type !== 'video') continue;
      const rawDims: unknown = fm.dimensions;
      const dims = (Array.isArray(rawDims) ? rawDims : rawDims ? [rawDims] : [])
        .map(String)
        .map((label) => labelToKind(label) ?? label);
      cards.push({
        path: file.path,
        title: fm.title ? String(fm.title) : file.basename,
        videoId: fm.video_id ? String(fm.video_id) : '',
        platform: fm.platform ? String(fm.platform) : undefined,
        channel: fm.channel ? String(fm.channel) : undefined,
        dimensions: [...new Set(dims)],
        depth: fm.depth ? String(fm.depth) : undefined,
        views: fm.views ? String(fm.views) : undefined,
        note: fm.note ? String(fm.note) : undefined,
        date: fm.analyzed_at
          ? String(fm.analyzed_at).slice(0, 10)
          : new Date(file.stat.ctime).toISOString().slice(0, 10),
      });
    }
    return cards;
  }

  private dimLabel(dim: string): string {
    const kinds: SectionKind[] = ['cover', 'content', 'motion', 'screenshot'];
    return (kinds as string[]).includes(dim) ? headingLabel(dim as SectionKind) : dim;
  }

  private render(): void {
    const root = this.contentEl;
    root.empty();
    root.addClass('vap-gallery');

    const cards = this.collectCards();
    if (cards.length === 0) {
      root.createEl('div', { text: t('gallery.empty'), cls: 'vap-empty' });
      return;
    }

    const bar = root.createEl('div', { cls: 'vap-filter-bar' });
    const chip = (text: string, active: boolean, onClick: () => void) => {
      const el = bar.createEl('span', { text, cls: 'vap-chip' + (active ? ' active' : '') });
      el.onclick = () => { onClick(); this.render(); };
    };

    const f = this.filter;
    const isAll = f.dims.length === 0 && !f.platform && !f.source;
    chip(t('gallery.all'), isAll, () => { this.filter = { ...EMPTY_FILTER, dims: [] }; });
    for (const p of platformChips(cards)) {
      chip(PLATFORM_LABELS[p] ?? p, f.platform === p,
        () => { f.platform = f.platform === p ? null : p; });
    }
    for (const dim of dimensionChips(cards)) {
      chip(this.dimLabel(dim), f.dims.includes(dim),
        () => { f.dims = f.dims.includes(dim) ? f.dims.filter(d => d !== dim) : [...f.dims, dim]; });
    }
    if (hasDeep(cards)) {
      chip(t('gallery.deep'), f.source === DEEP_SOURCE,
        () => { f.source = f.source === DEEP_SOURCE ? null : DEEP_SOURCE; });
    }
    for (const ch of channelChips(cards)) {
      chip(ch, f.source === ch, () => { f.source = f.source === ch ? null : ch; });
    }

    const grid = root.createEl('div', { cls: 'vap-grid' });
    const coversFolder = this.plugin.settings.clipRules.thumbnail.thumbnailFolder;
    for (const c of filterCards(cards, this.filter)) {
      const card = grid.createEl('a', { cls: 'vap-card' + (c.depth === 'deep' ? ' vap-card-deep' : '') });
      card.onclick = (e) => { e.preventDefault(); this.app.workspace.openLinkText(c.path, '', false); };

      const imgWrap = card.createEl('div', { cls: 'vap-img-wrap' });
      if (c.videoId) {
        const src = this.app.vault.adapter.getResourcePath(`${coversFolder}/${c.videoId}.webp`);
        imgWrap.createEl('img', { attr: { src, loading: 'lazy' } });
      }
      if (c.depth === 'deep') imgWrap.createEl('span', { text: t('gallery.deep'), cls: 'vap-deep-badge' });

      const body = card.createEl('div', { cls: 'vap-body' });
      if (c.channel) body.createEl('span', { text: c.channel, cls: 'vap-creator' });
      body.createEl('div', { text: c.title, cls: 'vap-title' });
      if (c.note) body.createEl('div', { text: c.note, cls: 'vap-highlight' });
      const footer = body.createEl('div', { cls: 'vap-footer' });
      footer.createEl('span', { text: c.views ? `▶ ${c.views}` : '', cls: 'vap-views' });
      footer.createEl('span', { text: c.date ?? '', cls: 'vap-date' });
    }
  }
}
