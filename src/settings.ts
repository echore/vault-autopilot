import { App, PluginSettingTab, Setting } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings, ScreenshotClipRule, ThumbnailClipRule } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
  httpServer: {
    enabled: true,
    port: 27183,
  },
  clipRules: {
    thumbnail: { sopPath: '', outputFolder: 'Content Creation/Great Videos', thumbnailFolder: 'Assets/Great Videos', providerId: '', processingMode: 'manual' },
    screenshot: { sopPath: '', outputFolder: '', providerId: '', processingMode: 'manual', framesFolder: 'Assets/images' },
    hook: { sopPath: '', outputFolder: '', providerId: '', processingMode: 'manual', maxFrames: 5, framesFolder: 'Assets/images' },
    keyframe: { sopPath: '', outputFolder: '', providerId: '', processingMode: 'manual', maxFrames: 5, framesFolder: 'Assets/images' },
  },
};

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
      .setDesc('Default: 27183. Restart Obsidian after changing.')
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
