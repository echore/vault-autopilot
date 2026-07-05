import { App, PluginSettingTab, Setting } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings } from './types';

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
  firstSaveNoticed: { thumbnail: false, screenshot: false, hook: false, keyframe: false },
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
export function emptyToDefault<T extends object>(loaded: Partial<T> | undefined, defaults: T): T {
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

    // ── 存储位置 ────────────────────────────────────────────────────────────────
    // One note per video: cover / hook / keyframe clips all upsert sections into
    // the same note, so there is exactly one "video notes" location — the UI must
    // not pretend each mode has its own output folder.
    new Setting(containerEl).setName('存储位置').setHeading();

    new Setting(containerEl)
      .setName('视频笔记文件夹')
      .setDesc('一个视频一条笔记：封面、Hook、关键帧都写进同一条。默认 Clips/Videos')
      .addText(t => t
        .setValue(this.plugin.settings.clipRules.thumbnail.outputFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('封面图片文件夹')
      .setDesc('视频封面图（<视频ID>.webp）。默认 Clips/Videos/covers')
      .addText(t => t
        .setValue(this.plugin.settings.clipRules.thumbnail.thumbnailFolder)
        .onChange(async v => {
          this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('帧图片文件夹')
      .setDesc('Hook / 关键帧抽出的帧图。默认 Clips/Videos/frames')
      .addText(t => t
        .setValue(this.plugin.settings.clipRules.hook.framesFolder)
        .onChange(async v => {
          const folder = v.trim();
          this.plugin.settings.clipRules.hook.framesFolder = folder;
          this.plugin.settings.clipRules.keyframe.framesFolder = folder;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('截图文件夹')
      .setDesc('普通网页截图独立成笔记，存在这里；图片自动放入其 frames/ 子文件夹。默认 Clips/Screenshots')
      .addText(t => t
        .setValue(this.plugin.settings.clipRules.screenshot.outputFolder)
        .onChange(async v => {
          const folder = v.trim();
          this.plugin.settings.clipRules.screenshot.outputFolder = folder;
          this.plugin.settings.clipRules.screenshot.framesFolder = folder ? `${folder}/frames` : '';
          await this.plugin.saveSettings();
        }));

    // ── 高级 ────────────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('高级').setHeading();

    new Setting(containerEl)
      .setName('启用 HTTP 服务')
      .setDesc('接收 Chrome 扩展通过 POST /clip 发来的内容')
      .addToggle(t => t.setValue(this.plugin.settings.httpServer.enabled).onChange(async v => {
        this.plugin.settings.httpServer.enabled = v;
        await this.plugin.saveSettings();
        this.plugin.restartServer();
      }));

    new Setting(containerEl)
      .setName('端口')
      .setDesc('默认 17183。仅当端口被占用时才需要改；改完必须在扩展的引导页（高级 → 端口）改成同一个值，否则两边会断开。改后重启 Obsidian。')
      .addText(t => t.setValue(String(this.plugin.settings.httpServer.port)).onChange(async v => {
        const n = parseInt(v, 10);
        if (n > 1024 && n < 65536) { this.plugin.settings.httpServer.port = n; await this.plugin.saveSettings(); }
      }));

    new Setting(containerEl)
      .setName('抽帧数量上限')
      .setDesc('Hook / 关键帧模式最多保存几帧（1–20）。默认 5。')
      .addText(t => t
        .setValue(String(this.plugin.settings.clipRules.hook.maxFrames))
        .onChange(async v => {
          const n = parseInt(v, 10);
          if (n >= 1 && n <= 20) {
            this.plugin.settings.clipRules.hook.maxFrames = n;
            this.plugin.settings.clipRules.keyframe.maxFrames = n;
            await this.plugin.saveSettings();
          }
        }));

    const sopModes = [
      ['thumbnail', '封面 SOP 路径'],
      ['screenshot', '截图 SOP 路径'],
      ['hook', 'Hook SOP 路径'],
      ['keyframe', '关键帧 SOP 路径'],
    ] as const;
    for (const [mode, label] of sopModes) {
      new Setting(containerEl)
        .setName(label)
        .setDesc('留空 = 纯素材模式（不附带分析提示）。填 vault 内 markdown 文件的绝对路径。')
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].sopPath)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].sopPath = v.trim();
            await this.plugin.saveSettings();
          }));
    }
  }
}
