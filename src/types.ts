import type { Language } from './i18n';

// ── Rules ─────────────────────────────────────────────────────────────────────

export interface ClipRule {
  sopPath: string;       // absolute path to SOP markdown file
  outputFolder: string;  // vault-relative path
  maxFrames: number;
  framesFolder: string;  // vault-relative path for frame PNGs (e.g. "Assets/images")
}

export interface ScreenshotClipRule {
  sopPath: string;
  outputFolder: string;
  framesFolder: string;
}

export interface ThumbnailClipRule {
  sopPath: string;
  outputFolder: string;        // vault-relative, e.g. Content Creation/Great Videos
  thumbnailFolder: string;     // vault-relative, e.g. Assets/Great Videos
}

// ── Plugin settings ───────────────────────────────────────────────────────────

export interface HttpServerSettings {
  enabled: boolean;
  port: number;
}

export type ClipMode = 'thumbnail' | 'screenshot' | 'hook' | 'keyframe';

export interface PluginSettings {
  language: Language;
  httpServer: HttpServerSettings;
  clipRules: {
    thumbnail: ThumbnailClipRule;
    screenshot: ScreenshotClipRule;
    hook: ClipRule;
    keyframe: ClipRule;
  };
  // One-time "saved to X — change it in settings" notice, tracked per mode.
  firstSaveNoticed: Record<ClipMode, boolean>;
}
