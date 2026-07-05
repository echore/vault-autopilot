import { App, PluginSettingTab, Setting } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings, ScreenshotClipRule, ThumbnailClipRule } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
  httpServer: {
    enabled: true,
    port: 17183,
  },
  clipRules: {
    thumbnail: { sopPath: '', outputFolder: 'Clips/Videos', thumbnailFolder: 'Clips/Videos/covers' },
    screenshot: { sopPath: '', outputFolder: 'Clips/Screenshots', framesFolder: 'Clips/Screenshots/frames' },
    hook: { sopPath: '', outputFolder: '', maxFrames: 5, framesFolder: 'Clips/Videos/frames' },
    keyframe: { sopPath: '', outputFolder: '', maxFrames: 5, framesFolder: 'Clips/Videos/frames' },
  },
};

// 27183 was the original default; it collides with scrcpy's port range
// (27183–27199), so existing installs on the old default migrate silently.
const LEGACY_DEFAULT_PORT = 27183;

export function normalizePort(loaded: number | undefined): number {
  if (loaded === undefined || loaded === LEGACY_DEFAULT_PORT) return DEFAULT_SETTINGS.httpServer.port;
  return loaded;
}

// Folder fields left empty ('') mean "never configured" — fall back to the
// default so every mode works out of the box. sopPath is the one exception:
// empty is a valid state (material-only mode, no analysis prompt).
export function emptyToDefault<T extends Record<string, unknown>>(loaded: Partial<T> | undefined, defaults: T): T {
  const merged = { ...defaults, ...(loaded ?? {}) } as T;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    if (key !== 'sopPath' && merged[key] === '' && defaults[key] !== '') merged[key] = defaults[key];
  }
  return merged;
}

export class VaultAutopilotSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: VaultAutopilotPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // ── HTTP Server ────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('HTTP Server').setHeading();

    new Setting(containerEl)
      .setName('Enable HTTP server')
      .setDesc('Allows Chrome extension and other tools to drop files via POST /clip')
      .addToggle(t => t.setValue(this.plugin.settings.httpServer.enabled).onChange(async v => {
        this.plugin.settings.httpServer.enabled = v;
        await this.plugin.saveSettings();
        this.plugin.restartServer();
      }));

    new Setting(containerEl)
      .setName('Port')
      .setDesc('Default: 17183. Restart Obsidian after changing.')
      .addText(t => t.setValue(String(this.plugin.settings.httpServer.port)).onChange(async v => {
        const n = parseInt(v, 10);
        if (n > 1024 && n < 65536) { this.plugin.settings.httpServer.port = n; await this.plugin.saveSettings(); }
      }));

    // ── Clip Rules ──────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('Clip Rules').setHeading();

    new Setting(containerEl).setName('Thumbnail / Great Videos').setHeading();
    this.renderThumbnailClipRule(containerEl);

    new Setting(containerEl).setName('Screenshot').setHeading();
    this.renderScreenshotClipRule(containerEl);

    for (const mode of ['hook', 'keyframe'] as const) {
      const label = mode === 'hook' ? 'Hook Analysis' : 'Keyframe Analysis';
      new Setting(containerEl).setName(label).setHeading();
      new Setting(containerEl)
        .setName('Max frames to save')
        .setDesc('How many frames to sample and save (1–20). Default: 5.')
        .addText(t => t
          .setValue(String(this.plugin.settings.clipRules[mode].maxFrames))
          .onChange(async v => {
            const n = parseInt(v, 10);
            if (n >= 1 && n <= 20) {
              this.plugin.settings.clipRules[mode].maxFrames = n;
              await this.plugin.saveSettings();
            }
          }));
      new Setting(containerEl)
        .setName('Frames folder')
        .setDesc('Vault-relative path where frame images are saved. Default: Assets/images')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].framesFolder)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].framesFolder = v.trim();
            await this.plugin.saveSettings();
          }));
      new Setting(containerEl)
        .setName('SOP / prompt path')
        .setDesc('Absolute path to the markdown SOP file.')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].sopPath)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].sopPath = v.trim();
            await this.plugin.saveSettings();
          }));
      new Setting(containerEl)
        .setName('Output folder')
        .setDesc('Vault-relative path. e.g. Notes/Hooks')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].outputFolder)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].outputFolder = v.trim();
            await this.plugin.saveSettings();
          }));
    }
  }

  private renderThumbnailClipRule(el: HTMLElement): void {
    const rule: ThumbnailClipRule = this.plugin.settings.clipRules.thumbnail;
    new Setting(el)
      .setName('Output folder')
      .setDesc('Vault-relative path for generated notes. Default: Content Creation/Great Videos')
      .addText(t => t
        .setValue(rule.outputFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
          await this.plugin.saveSettings();
        }));
    new Setting(el)
      .setName('Thumbnail folder')
      .setDesc('Vault-relative path for downloaded thumbnail images. Default: Assets/Great Videos')
      .addText(t => t
        .setValue(rule.thumbnailFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
          await this.plugin.saveSettings();
        }));
    new Setting(el)
      .setName('SOP / prompt path')
      .setDesc('Absolute path to the markdown SOP file.')
      .addText(t => t
        .setValue(rule.sopPath)
        .onChange(async v => {
          this.plugin.settings.clipRules.thumbnail.sopPath = v.trim();
          await this.plugin.saveSettings();
        }));
  }

  private renderScreenshotClipRule(el: HTMLElement): void {
    const rule: ScreenshotClipRule = this.plugin.settings.clipRules.screenshot;
    new Setting(el)
      .setName('Frames folder')
      .setDesc('Vault-relative path where screenshot images are saved. Default: Assets/images')
      .addText(t => t
        .setValue(rule.framesFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.screenshot.framesFolder = v.trim();
          await this.plugin.saveSettings();
        }));
    new Setting(el)
      .setName('SOP / prompt path')
      .setDesc('Absolute path to the markdown SOP file.')
      .addText(t => t
        .setValue(rule.sopPath)
        .onChange(async v => {
          this.plugin.settings.clipRules.screenshot.sopPath = v.trim();
          await this.plugin.saveSettings();
        }));
    new Setting(el)
      .setName('Output folder')
      .setDesc('Vault-relative path. e.g. Notes/Screenshots')
      .addText(t => t
        .setValue(rule.outputFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.screenshot.outputFolder = v.trim();
          await this.plugin.saveSettings();
        }));
  }
}
