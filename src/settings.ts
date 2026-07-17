import { App, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings } from './types';
import { t, setLanguage, Language } from './i18n';

export const DEFAULT_SETTINGS: PluginSettings = {
  language: 'en',
  baseFolder: 'Clips',
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

export function deriveFolders(base: string) {
  const b = base.trim().replace(/\/+$/, '') || 'Clips';
  return {
    videoNotes: `${b}/Videos`,
    covers: `${b}/Videos/covers`,
    frames: `${b}/Videos/frames`,
    screenshots: `${b}/Screenshots`,
    screenshotFrames: `${b}/Screenshots/frames`,
  };
}

export function applyBaseFolder(settings: PluginSettings, base: string): void {
  const f = deriveFolders(base);
  settings.baseFolder = base.trim().replace(/\/+$/, '') || 'Clips';
  settings.clipRules.thumbnail.outputFolder = f.videoNotes;
  settings.clipRules.thumbnail.thumbnailFolder = f.covers;
  settings.clipRules.hook.framesFolder = f.frames;
  settings.clipRules.keyframe.framesFolder = f.frames;
  settings.clipRules.screenshot.outputFolder = f.screenshots;
  settings.clipRules.screenshot.framesFolder = f.screenshotFrames;
}

export class VaultAutopilotSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: VaultAutopilotPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName(t('settings.language'))
      .addDropdown(d => d
        .addOption('en', 'English')
        .addOption('zh', '中文')
        .setValue(this.plugin.settings.language)
        .onChange(async v => {
          this.plugin.settings.language = v as Language;
          setLanguage(this.plugin.settings.language);
          await this.plugin.saveSettings();
          this.display();
        }));

    // ── Storage locations ────────────────────────────────────────────────────────
    // One note per video: cover / hook / keyframe clips all upsert sections into
    // the same note, so there is exactly one "video notes" location — the UI must
    // not pretend each mode has its own output folder.
    new Setting(containerEl).setName(t('settings.storageHeading')).setHeading();

    const folderInputs: TextComponent[] = []; // [videoNotes, covers, frames, screenshots]

    new Setting(containerEl)
      .setName(t('settings.baseFolder.name'))
      .setDesc(t('settings.baseFolder.desc'))
      .addText(txt => txt
        .setValue(this.plugin.settings.baseFolder)
        .onChange(async v => {
          applyBaseFolder(this.plugin.settings, v);
          const f = deriveFolders(v);
          // setValue does not fire onChange, so this cannot loop.
          folderInputs[0]?.setValue(f.videoNotes);
          folderInputs[1]?.setValue(f.covers);
          folderInputs[2]?.setValue(f.frames);
          folderInputs[3]?.setValue(f.screenshots);
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName(t('settings.videoNotesFolder.name'))
      .setDesc(t('settings.videoNotesFolder.desc'))
      .addText(t2 => {
        folderInputs.push(t2);
        t2
          .setValue(this.plugin.settings.clipRules.thumbnail.outputFolder)
          .onChange(async v => {
            this.plugin.settings.clipRules.thumbnail.outputFolder = v.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.coverFolder.name'))
      .setDesc(t('settings.coverFolder.desc'))
      .addText(t2 => {
        folderInputs.push(t2);
        t2
          .setValue(this.plugin.settings.clipRules.thumbnail.thumbnailFolder)
          .onChange(async v => {
            this.plugin.settings.clipRules.thumbnail.thumbnailFolder = v.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.framesFolder.name'))
      .setDesc(t('settings.framesFolder.desc'))
      .addText(t2 => {
        folderInputs.push(t2);
        t2
          .setValue(this.plugin.settings.clipRules.hook.framesFolder)
          .onChange(async v => {
            const folder = v.trim();
            this.plugin.settings.clipRules.hook.framesFolder = folder;
            this.plugin.settings.clipRules.keyframe.framesFolder = folder;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.screenshotFolder.name'))
      .setDesc(t('settings.screenshotFolder.desc'))
      .addText(t2 => {
        folderInputs.push(t2);
        t2
          .setValue(this.plugin.settings.clipRules.screenshot.outputFolder)
          .onChange(async v => {
            const folder = v.trim();
            this.plugin.settings.clipRules.screenshot.outputFolder = folder;
            this.plugin.settings.clipRules.screenshot.framesFolder = folder ? `${folder}/frames` : '';
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName(t('settings.restoreDefaults.name'))
      .setDesc(t('settings.restoreDefaults.desc'))
      .addButton(b => b
        .setButtonText(t('settings.restoreDefaults.button'))
        .onClick(async () => {
          applyBaseFolder(this.plugin.settings, 'Clips');
          await this.plugin.saveSettings();
          this.display();
        }));

    // ── Advanced ──────────────────────────────────────────────────────────────────
    new Setting(containerEl).setName(t('settings.advancedHeading')).setHeading();

    new Setting(containerEl)
      .setName(t('settings.httpEnable.name'))
      .setDesc(t('settings.httpEnable.desc'))
      .addToggle(t => t.setValue(this.plugin.settings.httpServer.enabled).onChange(async v => {
        this.plugin.settings.httpServer.enabled = v;
        await this.plugin.saveSettings();
        this.plugin.restartServer();
      }));

    new Setting(containerEl)
      .setName(t('settings.port.name'))
      .setDesc(t('settings.port.desc'))
      .addText(t => t.setValue(String(this.plugin.settings.httpServer.port)).onChange(async v => {
        const n = parseInt(v, 10);
        if (n > 1024 && n < 65536) { this.plugin.settings.httpServer.port = n; await this.plugin.saveSettings(); }
      }));

    new Setting(containerEl)
      .setName(t('settings.maxFrames.name'))
      .setDesc(t('settings.maxFrames.desc'))
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
      ['thumbnail', t('settings.sop.thumbnail')],
      ['screenshot', t('settings.sop.screenshot')],
      ['hook', t('settings.sop.hook')],
      ['keyframe', t('settings.sop.keyframe')],
    ] as const;
    for (const [mode, label] of sopModes) {
      new Setting(containerEl)
        .setName(label)
        .setDesc(t('settings.sop.desc'))
        .addText(t => t
          .setValue(this.plugin.settings.clipRules[mode].sopPath)
          .onChange(async v => {
            this.plugin.settings.clipRules[mode].sopPath = v.trim();
            await this.plugin.saveSettings();
          }));
    }
  }
}
