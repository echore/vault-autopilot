import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs';
import { Notice, Plugin, TFile, requestUrl } from 'obsidian';
import { DEFAULT_SETTINGS, VaultAutopilotSettingTab } from './settings';
import { PluginSettings, WatchRule, AIProvider, ProviderConfig } from './types';
import { createCLIProvider } from './providers/cli-base';
import { createOpenAICompatProvider } from './providers/openai-compat';
import { createAnthropicProvider } from './providers/anthropic';
import { createGeminiAPIProvider } from './providers/gemini-api';
import { detectBinaryPath } from './path-detector';
import { processFile, isSupportedFileType } from './processor';
import { createServer, ClipPayload } from './server';
import { routeClip, VaultOps } from './clip-router';
import { runStartupChecks } from './startup-check';
import { postProcessMarkdown } from './util';

export default class VaultAutopilotPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  private server: http.Server | null = null;
  private providers = new Map<string, AIProvider>();

  async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new VaultAutopilotSettingTab(this.app, this));
    this.rebuildProviders();
    runStartupChecks(this.settings);
    this.app.workspace.onLayoutReady(() => {
      this.registerVaultWatcher();
    });
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
      httpServer: { ...DEFAULT_SETTINGS.httpServer, ...(loaded?.httpServer ?? {}) },
      clipRules: {
        thumbnail: { ...DEFAULT_SETTINGS.clipRules.thumbnail, ...(loaded?.clipRules?.thumbnail ?? {}) },
        screenshot: { ...DEFAULT_SETTINGS.clipRules.screenshot, ...(loaded?.clipRules?.screenshot ?? {}) },
        hook: { ...DEFAULT_SETTINGS.clipRules.hook, ...(loaded?.clipRules?.hook ?? {}) },
        keyframe: { ...DEFAULT_SETTINGS.clipRules.keyframe, ...(loaded?.clipRules?.keyframe ?? {}) },
      },
      rules: loaded?.rules ?? DEFAULT_SETTINGS.rules,
      providers: loaded?.providers ?? DEFAULT_SETTINGS.providers,
    };
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.rebuildProviders();
  }

  restartServer(): void {
    this.server?.close();
    this.server = null;
    if (this.settings.httpServer.enabled) this.startServer();
  }

  private rebuildProviders(): void {
    this.providers.clear();
    for (const config of this.settings.providers) {
      this.providers.set(config.id, this.buildProvider(config));
    }
  }

  private buildProvider(config: ProviderConfig): AIProvider {
    if (config.type === 'cli') {
      const resolvedBin = detectBinaryPath(config.cliType, config.bin);
      return createCLIProvider({ ...config, bin: resolvedBin });
    }
    if (config.type === 'openai-compat') return createOpenAICompatProvider(config);
    if (config.type === 'anthropic') return createAnthropicProvider(config);
    if (config.type === 'gemini-api') return createGeminiAPIProvider(config);
    throw new Error(`Unknown provider type: ${(config as any).type}`);
  }

  private registerVaultWatcher(): void {
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (!(file instanceof TFile)) return;
        if (!isSupportedFileType(file.name)) return;
        const rule = this.findMatchingRule(file.path);
        if (!rule) return;
        this.handleNewFile(file, rule).catch((err) => {
          const msg = `Failed to process "${file.name}": ${err.message}`;
          new Notice(`Vault Autopilot: ${msg}`, 10000);
          this.appendError(msg);
        });
      }),
    );
  }

  private findMatchingRule(filePath: string): WatchRule | null {
    return this.settings.rules.find(
      (r) => r.enabled && filePath.startsWith(r.watchFolder + '/'),
    ) || null;
  }

  private async handleNewFile(file: TFile, rule: WatchRule): Promise<void> {
    const provider = this.providers.get(rule.providerId);
    if (!provider) throw new Error(`Provider "${rule.providerId}" not configured`);

    const vaultPath = (this.app.vault.adapter as any).getBasePath() as string;
    const absolutePath = path.join(vaultPath, file.path);

    // Read companion meta.json if it exists (written by Chrome extension or other clients)
    const meta = await this.readMeta(file.path);
    const markdown = postProcessMarkdown(await processFile(absolutePath, rule, provider, meta));

    // Write output note
    const stem = path.basename(file.name, path.extname(file.name));
    const outputPath = `${rule.outputFolder}/${stem}.md`;
    await this.ensureFolder(rule.outputFolder);
    await this.app.vault.create(outputPath, markdown);
  }

  private async readMeta(filePath: string): Promise<{ source_url?: string; title?: string }> {
    const metaPath = filePath.replace(/\.[^.]+$/, '.meta.json');
    const metaFile = this.app.vault.getAbstractFileByPath(metaPath);
    if (!(metaFile instanceof TFile)) return {};
    try {
      return JSON.parse(await this.app.vault.read(metaFile));
    } catch {
      return {};
    }
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
      createBinary: async (p, data) => { await this.app.vault.createBinary(p, data); },
      create: async (p, content) => { await this.app.vault.create(p, content); },
      readFileSync: (p) => fs.readFileSync(p, 'utf8'),
      downloadUrl: async (url) => {
        const resp = await requestUrl({ url, method: 'GET' });
        return resp.arrayBuffer;
      },
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
        const notePath = await routeClip(payload, this.providers, this.settings.clipRules, this.settings.rules, vaultOps);
        if (!notePath) return undefined;
        const vault = encodeURIComponent(this.app.vault.getName());
        return `obsidian://open?vault=${vault}&file=${encodeURIComponent(notePath)}`;
      },
    );
    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        new Notice(`Vault Autopilot: Port ${port} is already in use. Close the other process or change the port in settings.`, 10000);
      }
    });
  }

  private async appendError(message: string): Promise<void> {
    const logPath = 'vault-autopilot-errors.md';
    const timestamp = new Date().toISOString();
    const line = `- ${timestamp}: ${message}\n`;
    const existing = this.app.vault.getAbstractFileByPath(logPath);
    if (existing instanceof TFile) {
      const content = await this.app.vault.read(existing);
      await this.app.vault.modify(existing, content + line);
    } else {
      await this.app.vault.create(logPath, `# Vault Autopilot Errors\n\n${line}`);
    }
  }
}
