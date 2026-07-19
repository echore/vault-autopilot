import * as http from 'http';
import * as fs from 'fs';
import * as nodePath from 'path';
import { FileSystemAdapter, Notice, Plugin, TFile, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, VaultAutopilotSettingTab, normalizePort, emptyToDefault } from './settings';
import { PluginSettings, ClipMode } from './types';
import { createServer, ClipPayload } from './server';
import { routeClip, VaultOps } from './clip-router';
import { SopInstallOps, builtinSopFor } from './bundled-sops';
import { GalleryView, GALLERY_VIEW_TYPE } from './gallery-view';
import { t, setLanguage } from './i18n';
import { assertDownloadable, makeSerialQueue } from './util';

export default class VaultAutopilotPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private server: http.Server | null = null;
  // Double-clicks / extension retries race their read-modify-write on the same
  // note; every clip goes through this queue so only one is in flight at a time.
  private enqueueClip = makeSerialQueue();

  async onload(): Promise<void> {
    await this.loadSettings();
    setLanguage(this.settings.language);
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    this.registerView(GALLERY_VIEW_TYPE, (leaf) => new GalleryView(leaf, this));
    this.addRibbonIcon('layout-grid', t('gallery.open'), () => this.activateGallery());
    if (this.settings.httpServer.enabled) this.startServer();
  }

  async activateGallery(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(GALLERY_VIEW_TYPE)[0];
    if (existing) { await this.app.workspace.revealLeaf(existing); return; }
    const leaf = this.app.workspace.getLeaf(true);
    await leaf.setViewState({ type: GALLERY_VIEW_TYPE, active: true });
  }

  onunload(): void {
    this.server?.close();
    this.server = null;
  }

  async loadSettings(): Promise<void> {
    const loaded = await this.loadData();
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      httpServer: {
        ...DEFAULT_SETTINGS.httpServer,
        ...(loaded?.httpServer ?? {}),
        port: normalizePort(loaded?.httpServer?.port),
      },
      clipRules: {
        thumbnail: emptyToDefault(loaded?.clipRules?.thumbnail, DEFAULT_SETTINGS.clipRules.thumbnail),
        screenshot: emptyToDefault(loaded?.clipRules?.screenshot, DEFAULT_SETTINGS.clipRules.screenshot),
        hook: emptyToDefault(loaded?.clipRules?.hook, DEFAULT_SETTINGS.clipRules.hook),
        keyframe: emptyToDefault(loaded?.clipRules?.keyframe, DEFAULT_SETTINGS.clipRules.keyframe),
      },
      firstSaveNoticed: { ...DEFAULT_SETTINGS.firstSaveNoticed, ...(loaded?.firstSaveNoticed ?? {}) },
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  restartServer(): void {
    const start = () => { if (this.settings.httpServer.enabled) this.startServer(); };
    const old = this.server;
    this.server = null;
    // Rebind only after the old socket has fully closed; starting on the same
    // tick races the close and hits EADDRINUSE on the same port.
    if (old) old.close(() => start());
    else start();
  }

  private async ensureFolder(folderPath: string): Promise<void> {
    const parts = folderPath.split('/');
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (!this.app.vault.getAbstractFileByPath(current)) {
        await this.app.vault.createFolder(current);
      }
    }
  }

  // Built-in SOP contents for modes whose sopPath is empty, respecting the
  // master switch and the plugin language.
  builtinSops(): Partial<Record<ClipMode, string>> {
    if (!this.settings.useBuiltinSops) return {};
    const lang = this.settings.language;
    return {
      thumbnail: builtinSopFor('thumbnail', lang),
      hook: builtinSopFor('hook', lang),
      keyframe: builtinSopFor('keyframe', lang),
    };
  }

  // Narrow vault access for the settings tab's bundled-SOP installer.
  sopInstallOps(): SopInstallOps {
    return {
      fileExists: (p) => this.app.vault.getAbstractFileByPath(p) != null,
      ensureFolder: (p) => this.ensureFolder(p),
      create: async (p, content) => { await this.app.vault.create(p, content); },
    };
  }

  // First successful save per mode: tell the user where it landed and that the
  // location is changeable — they can't design folders before seeing output.
  private async maybeFirstSaveNotice(mode: ClipMode, notePath: string): Promise<void> {
    if (this.settings.firstSaveNoticed[mode]) return;
    this.settings.firstSaveNoticed[mode] = true;
    const folder = notePath.includes('/') ? notePath.split('/').slice(0, -1).join('/') : '/';
    new Notice(t('notice.savedTo', { folder }), 8000);
    try {
      await this.saveSettings();
    } catch {
      // Transient disk error must not fail the clip response; acceptable consequence
      // is a repeat notice after reload when the flag reverts.
    }
  }

  private startServer(): void {
    const { port } = this.settings.httpServer;
    const vaultOps: VaultOps = {
      ensureFolder: (p) => this.ensureFolder(p),
      createBinary: async (p, data) => {
        // Overwrite if it already exists (e.g. an auto-saved cover) — createBinary throws otherwise.
        const existing = this.app.vault.getAbstractFileByPath(p);
        if (existing instanceof TFile) await this.app.vault.modifyBinary(existing, data);
        else await this.app.vault.createBinary(p, data);
      },
      create: async (p, content) => { await this.app.vault.create(p, content); },
      readFileSync: (p) => {
        // sopPath accepts both absolute paths and vault-relative ones (the
        // Customize button fills vault-relative paths). Absolute paths may
        // point outside the vault, which the Vault API cannot read — hence
        // Node fs instead of this.app.vault.adapter.
        const abs = nodePath.isAbsolute(p)
          ? p
          : nodePath.join((this.app.vault.adapter as FileSystemAdapter).getBasePath(), p);
        return fs.readFileSync(abs, 'utf8');
      },
      downloadUrl: async (url) => {
        assertDownloadable(url);
        const resp = await requestUrl({ url, method: 'GET' });
        const MAX = 25 * 1024 * 1024; // 25 MB — covers/thumbnails are far smaller
        if (resp.arrayBuffer.byteLength > MAX) throw new Error('Remote file too large');
        return resp.arrayBuffer;
      },
      fileExists: (p) => this.app.vault.getAbstractFileByPath(p) != null,
      listMarkdownFiles: (folderPath) => {
        return this.app.vault.getFiles()
          .filter(f => f.path.startsWith(folderPath + '/') && f.extension === 'md')
          .map(f => f.path);
      },
      read: async (filePath) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) throw new Error(`File not found: ${filePath}`);
        return this.app.vault.read(file);
      },
      modify: async (filePath, content) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) throw new Error(`File not found: ${filePath}`);
        await this.app.vault.modify(file, content);
      },
      getFrontmatter: (filePath) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        if (!(file instanceof TFile)) return null;
        return this.app.metadataCache.getFileCache(file)?.frontmatter ?? null;
      },
    };
    this.server = createServer(
      port,
      (payload) => this.enqueueClip(async () => {
        const { notePath, notice } = await routeClip(payload, this.settings.clipRules, vaultOps, this.builtinSops());
        if (notePath) await this.maybeFirstSaveNotice(payload.mode, notePath);
        const obsidianUrl = notePath
          ? `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(notePath)}`
          : undefined;
        return { obsidianUrl, notice };
      }),
      this.manifest.version,
    );
    this.server.on('error', (err: NodeJS.ErrnoException) => {
      // A failed listen leaves a dead server; drop the reference so /ping and
      // clips report honestly and the next toggle/restart can rebind.
      this.server = null;
      new Notice(
        err.code === 'EADDRINUSE' ? t('notice.portInUse', { port }) : t('notice.serverError', { port }),
        10000,
      );
    });
  }
}
