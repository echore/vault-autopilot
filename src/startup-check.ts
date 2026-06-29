import * as fs from 'fs';
import { Notice } from 'obsidian';
import { detectBinaryPath } from './path-detector';
import { PluginSettings } from './types';

/**
 * Run on plugin load. Shows a Notice for each misconfiguration found.
 * Returns list of problem strings (empty = all good).
 */
export function runStartupChecks(settings: PluginSettings): string[] {
  const problems: string[] = [];

  // Check each provider
  for (const prov of settings.providers) {
    if (prov.type === 'cli') {
      const resolved = detectBinaryPath(prov.cliType, prov.bin);
      if (resolved === prov.cliType) {
        // fell back to bare name — binary not found in known paths
        problems.push(`CLI provider "${prov.cliType}": binary not found. Open plugin settings and set the full path.`);
      }
    } else if (prov.type === 'anthropic' || prov.type === 'gemini-api') {
      if (!prov.apiKey) problems.push(`Provider "${prov.type}": API key is empty.`);
      if (!prov.model) problems.push(`Provider "${prov.type}": model is empty.`);
    } else if (prov.type === 'openai-compat') {
      if (!prov.apiKey) problems.push(`Provider "${prov.label}": API key is empty.`);
      if (!prov.model) problems.push(`Provider "${prov.label}": model is empty.`);
      if (!prov.baseUrl) problems.push(`Provider "${prov.label}": base URL is empty.`);
    }
  }

  // Show as Notice (each problem gets its own so they don't stack-truncate)
  for (const p of problems) {
    new Notice(`Vault Autopilot: ${p}`, 10000);
  }

  return problems;
}
