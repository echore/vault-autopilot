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

// ── Plugin settings ───────────────────────────────────────────────────────────

export interface HttpServerSettings {
  enabled: boolean;
  port: number;
}

export interface PluginSettings {
  rules: WatchRule[];
  providers: ProviderConfig[];
  httpServer: HttpServerSettings;
}
