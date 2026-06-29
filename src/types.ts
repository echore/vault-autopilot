export type FileType = 'image' | 'text';

export interface FileMeta {
  source_url?: string;
  title?: string;
}

export interface AnalysisRequest {
  filePath: string;       // absolute path to the file on disk
  fileType: FileType;
  fileContent: Buffer;    // raw bytes
  sopContent: string;     // contents of the SOP/prompt file
  meta: FileMeta;
}

export interface AIProvider {
  id: string;
  name: string;
  analyze(request: AnalysisRequest): Promise<string>; // returns markdown note content
}

export interface MultiFrameRequest {
  frames: Buffer[];
  transcript?: string;
  sopContent: string;
  meta: {
    video_title?: string;
    channel?: string;
    platform?: string;
    url?: string;
    time_range?: { start: number; end: number };
    captured_at?: string;
  };
}

export interface MultiFrameProvider extends AIProvider {
  analyzeMultiFrame(req: MultiFrameRequest): Promise<string>;
}

export function isMultiFrameProvider(p: AIProvider): p is MultiFrameProvider {
  return typeof (p as any).analyzeMultiFrame === 'function';
}

// ── Provider configs ──────────────────────────────────────────────────────────

export interface CLIProviderConfig {
  id: string;
  type: 'cli';
  cliType: 'claude' | 'gemini' | 'codex';
  bin: string;            // resolved absolute path or command name
}

export interface OpenAICompatProviderConfig {
  id: string;
  type: 'openai-compat';
  label: string;          // display name e.g. "OpenRouter", "Grok"
  baseUrl: string;        // e.g. https://openrouter.ai/api/v1
  apiKey: string;
  model: string;          // e.g. gpt-4o, meta-llama/llama-3.2-90b-vision
}

export interface AnthropicProviderConfig {
  id: string;
  type: 'anthropic';
  apiKey: string;
  model: string;          // e.g. claude-sonnet-4-6
}

export interface GeminiAPIProviderConfig {
  id: string;
  type: 'gemini-api';
  apiKey: string;
  model: string;          // e.g. gemini-1.5-flash
}

export type ProviderConfig =
  | CLIProviderConfig
  | OpenAICompatProviderConfig
  | AnthropicProviderConfig
  | GeminiAPIProviderConfig;

// ── Rules ─────────────────────────────────────────────────────────────────────

export interface WatchRule {
  id: string;
  enabled: boolean;
  watchFolder: string;    // vault-relative path
  sopPath: string;        // absolute path to SOP/prompt markdown file
  outputFolder: string;   // vault-relative path
  providerId: string;     // must match a ProviderConfig.id
}

export interface ClipRule {
  sopPath: string;       // absolute path to SOP markdown file
  outputFolder: string;  // vault-relative path
  providerId: string;    // must match a ProviderConfig.id
  processingMode: 'auto' | 'manual';
  maxFrames: number;
  framesFolder: string;  // vault-relative path for frame PNGs (e.g. "Assets/images")
}

export interface ScreenshotClipRule {
  sopPath: string;
  outputFolder: string;
  providerId: string;
  processingMode: 'auto' | 'manual';
  framesFolder: string;
}

export interface ThumbnailClipRule {
  sopPath: string;
  outputFolder: string;        // vault-relative, e.g. Content Creation/Great Videos
  thumbnailFolder: string;     // vault-relative, e.g. Assets/Great Videos
  providerId: string;
  processingMode: 'auto' | 'manual';
}

// ── Plugin settings ───────────────────────────────────────────────────────────

export interface HttpServerSettings {
  enabled: boolean;
  port: number;
}

export interface PluginSettings {
  rules: WatchRule[];
  providers: ProviderConfig[];
  httpServer: HttpServerSettings;
  clipRules: {
    thumbnail: ThumbnailClipRule;
    screenshot: ScreenshotClipRule;
    hook: ClipRule;
    keyframe: ClipRule;
  };
}
