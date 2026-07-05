import * as http from 'http';
import * as fs from 'fs';
import { Notice, Plugin, TFile, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, VaultAutopilotSettingTab, normalizePort } from './settings';
import { PluginSettings } from './types';
import { createServer, ClipPayload } from './server';
import { routeClip, VaultOps } from './clip-router';

export default class VaultAutopilotPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private server: http.Server | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    if (this.settings.httpServer.enabled) this.startServer();
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
        thumbnail: { ...DEFAULT_SETTINGS.clipRules.thumbnail, ...(loaded?.clipRules?.thumbnail ?? {}) },
        screenshot: { ...DEFAULT_SETTINGS.clipRules.screenshot, ...(loaded?.clipRules?.screenshot ?? {}) },
        hook: { ...DEFAULT_SETTINGS.clipRules.hook, ...(loaded?.clipRules?.hook ?? {}) },
        keyframe: { ...DEFAULT_SETTINGS.clipRules.keyframe, ...(loaded?.clipRules?.keyframe ?? {}) },
      },
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  restartServer(): void {
    this.server?.close();
    this.server = null;
    if (this.settings.httpServer.enabled) this.startServer();
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
      readFileSync: (p) => fs.readFileSync(p, 'utf8'),
      downloadUrl: async (url) => {
        const resp = await requestUrl({ url, method: 'GET' });
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
    };
    this.server = createServer(
      port,
      async (payload) => {
        const { notePath, notice } = await routeClip(payload, this.settings.clipRules, vaultOps);
        const obsidianUrl = notePath
          ? `obsidian://open?vault=${encodeURIComponent(this.app.vault.getName())}&file=${encodeURIComponent(notePath)}`
          : undefined;
        return { obsidianUrl, notice };
      },
      this.manifest.version,
    );
    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        new Notice(`Vault Autopilot: Port ${port} is already in use. Close the other process or change the port in settings.`, 10000);
      }
    });
  }
}
