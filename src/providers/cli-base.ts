import { spawn } from 'child_process';
import { AIProvider, AnalysisRequest, CLIProviderConfig } from '../types';

// Each CLI provider has its own non-interactive flag and prompt format.
// NOTE: gemini and codex non-interactive flags verified against their CLIs at time of writing.
// If a future CLI version changes flags, update buildArgs() here.
const CLI_ARGS: Record<string, (prompt: string) => string[]> = {
  claude: (p) => ['-p', p, '--allowedTools', 'Read'],
  gemini: (p) => ['-p', p],
  codex:  (p) => ['--prompt', p, '--quiet'],
};

function buildPrompt(req: AnalysisRequest): string {
  const fileRef = req.fileType === 'image'
    ? `Image file path: ${req.filePath}`
    : `File content:\n\n${req.fileContent.toString('utf8')}`;

  return [
    '--- SOP / INSTRUCTIONS ---',
    req.sopContent,
    '--- FILE TO ANALYZE ---',
    fileRef,
    req.meta.source_url ? `Source URL: ${req.meta.source_url}` : '',
    req.meta.title ? `Title hint: ${req.meta.title}` : '',
    '--- OUTPUT INSTRUCTIONS ---',
    'Output the complete note as a markdown code block (```markdown ... ```).',
    'Do not add any explanation outside the code block.',
  ].filter(Boolean).join('\n');
}

function extractMarkdown(stdout: string): string {
  const match = stdout.match(/```markdown\r?\n([\s\S]*?)```/);
  return match ? match[1].trim() : stdout.trim();
}

export function createCLIProvider(config: CLIProviderConfig): AIProvider {
  const buildArgs = CLI_ARGS[config.cliType];
  if (!buildArgs) throw new Error(`Unknown CLI type: ${config.cliType}`);

  return {
    id: config.id,
    name: `CLI: ${config.cliType} (${config.bin})`,

    analyze(req: AnalysisRequest): Promise<string> {
      return new Promise((resolve, reject) => {
        const prompt = buildPrompt(req);
        const proc = spawn(config.bin, buildArgs(prompt), { timeout: 300_000 });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
        proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
        proc.on('close', (code, signal) => {
          if (signal) {
            reject(new Error(`${config.cliType} timed out after 300s`));
          } else if (code !== 0) {
            reject(new Error(stderr.trim() || `${config.cliType} exited with code ${code}`));
          } else {
            resolve(extractMarkdown(stdout));
          }
        });
        proc.on('error', (err) => reject(err));
      });
    },
  };
}
