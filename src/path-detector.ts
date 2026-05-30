import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const HOME = os.homedir();

export const KNOWN_PATHS: Record<string, string[]> = {
  claude: [
    // Mac - official installer
    path.join(HOME, '.claude', 'local', 'bin', 'claude'),
    // Homebrew / manual
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    path.join(HOME, '.local', 'bin', 'claude'),
    // Windows
    path.join(process.env['APPDATA'] || '', 'Claude', 'claude.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Claude', 'claude.exe'),
  ],
  gemini: [
    // npm global
    '/usr/local/bin/gemini',
    '/opt/homebrew/bin/gemini',
    path.join(HOME, '.npm-global', 'bin', 'gemini'),
    path.join(HOME, 'node_modules', '.bin', 'gemini'),
    // Windows npm global
    path.join(process.env['APPDATA'] || '', 'npm', 'gemini.cmd'),
  ],
  codex: [
    '/usr/local/bin/codex',
    '/opt/homebrew/bin/codex',
    path.join(HOME, '.npm-global', 'bin', 'codex'),
    // Windows
    path.join(process.env['APPDATA'] || '', 'npm', 'codex.cmd'),
  ],
};

/**
 * Returns the resolved path for a CLI binary.
 * Priority: configured path → known installation paths → bare name (rely on PATH at spawn time).
 */
export function detectBinaryPath(cliType: string, configured: string): string {
  if (configured && fs.existsSync(configured)) return configured;

  const candidates = KNOWN_PATHS[cliType] || [];
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }

  return cliType; // fall back to bare name; spawn will look in PATH
}
