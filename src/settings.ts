import * as crypto from 'crypto';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type VaultAutopilotPlugin from './main';
import { PluginSettings, ProviderConfig, WatchRule } from './types';

export const DEFAULT_SETTINGS: PluginSettings = {
  rules: [],
  providers: [],
  httpServer: {
    enabled: true,
    port: 27183,
  },
  clipRules: {
    hook: { sopPath: '', outputFolder: '', providerId: '' },
    keyframe: { sopPath: '', outputFolder: '', providerId: '' },
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

    // ── Providers ──────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('AI Providers').setHeading();
    new Setting(containerEl)
      .setName('Add provider')
      .setDesc('Configure at least one provider before creating rules.')
      .addDropdown(d => d
        .addOption('cli-claude', 'CLI: claude (Claude Code subscription)')
        .addOption('cli-gemini', 'CLI: gemini (Google account, free)')
        .addOption('cli-codex', 'CLI: codex (ChatGPT Plus subscription)')
        .addOption('openai-compat', 'API: OpenAI-compatible (OpenRouter / OpenAI / Grok / DeepSeek / Ollama)')
        .addOption('anthropic', 'API: Anthropic (Claude API)')
        .addOption('gemini-api', 'API: Google Gemini API')
      )
      .addButton(b => b.setButtonText('Add').onClick(async () => {
        const sel = containerEl.querySelector('select') as HTMLSelectElement;
        if (!sel) return;
        const type = sel.value;
        const id = crypto.randomBytes(4).toString('hex');
        let newProvider: ProviderConfig;
        if (type === 'openai-compat') {
          newProvider = { id, type: 'openai-compat', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', apiKey: '', model: '' };
        } else if (type === 'anthropic') {
          newProvider = { id, type: 'anthropic', apiKey: '', model: 'claude-sonnet-4-6' };
        } else if (type === 'gemini-api') {
          newProvider = { id, type: 'gemini-api', apiKey: '', model: 'gemini-1.5-flash' };
        } else {
          const cliType = type.replace('cli-', '') as 'claude' | 'gemini' | 'codex';
          newProvider = { id, type: 'cli', cliType, bin: '' };
        }
        this.plugin.settings.providers.push(newProvider);
        await this.plugin.saveSettings();
        this.display();
      }));

    for (const [i, prov] of this.plugin.settings.providers.entries()) {
      this.renderProvider(containerEl, prov, i);
    }

    // ── Rules ──────────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('Watch Rules').setHeading();
    new Setting(containerEl)
      .setName('Add rule')
      .addButton(b => b.setButtonText('Add rule').onClick(async () => {
        const id = crypto.randomBytes(4).toString('hex');
        this.plugin.settings.rules.push({ id, enabled: true, watchFolder: '', sopPath: '', outputFolder: '', providerId: this.plugin.settings.providers[0]?.id || '' });
        await this.plugin.saveSettings();
        this.display();
      }));

    for (const [i, rule] of this.plugin.settings.rules.entries()) {
      this.renderRule(containerEl, rule, i);
    }

    // ── Clip Rules ──────────────────────────────────────────────────────────────
    new Setting(containerEl).setName('Clip Rules').setHeading();
    new Setting(containerEl)
      .setName('Screenshot')
      .setDesc('Uses the first enabled Watch Rule above (watchFolder + provider + SOP).');

    for (const mode of ['hook', 'keyframe'] as const) {
      const label = mode === 'hook' ? 'Hook Analysis' : 'Keyframe Analysis';
      new Setting(containerEl).setName(label).setHeading();
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
      new Setting(containerEl)
        .setName('Provider')
        .setDesc('Must be an API provider (Anthropic, OpenAI-compatible, or Gemini).')
        .addDropdown(d => {
          this.plugin.settings.providers.forEach(p =>
            d.addOption(p.id, p.type === 'cli' ? `CLI: ${(p as any).cliType}` : (p as any).label || p.type)
          );
          d.setValue(this.plugin.settings.clipRules[mode].providerId)
            .onChange(async v => {
              this.plugin.settings.clipRules[mode].providerId = v;
              await this.plugin.saveSettings();
            });
        });
    }
  }

  private renderProvider(el: HTMLElement, prov: ProviderConfig, i: number): void {
    const label = prov.type === 'cli' ? `CLI: ${prov.cliType}` : prov.type === 'openai-compat' ? `API: ${prov.label}` : `API: ${prov.type}`;
    new Setting(el).setName(label).setHeading();

    if (prov.type === 'cli') {
      new Setting(el)
        .setName('Binary path')
        .setDesc(`Leave empty to auto-detect. Example: /usr/local/bin/${prov.cliType}`)
        .addText(t => t.setValue(prov.bin).onChange(async v => {
          (this.plugin.settings.providers[i] as any).bin = v.trim();
          await this.plugin.saveSettings();
        }));
    }
    if (prov.type === 'openai-compat') {
      new Setting(el).setName('Label').addText(t => t.setValue(prov.label).onChange(async v => { (this.plugin.settings.providers[i] as any).label = v; await this.plugin.saveSettings(); }));
      new Setting(el).setName('Base URL').setDesc('e.g. https://openrouter.ai/api/v1').addText(t => t.setValue(prov.baseUrl).onChange(async v => { (this.plugin.settings.providers[i] as any).baseUrl = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('API Key').addText(t => t.setValue(prov.apiKey).onChange(async v => { (this.plugin.settings.providers[i] as any).apiKey = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('Model').setDesc('Must support vision for image analysis. e.g. gpt-4o, openai/gpt-4o').addText(t => t.setValue(prov.model).onChange(async v => { (this.plugin.settings.providers[i] as any).model = v.trim(); await this.plugin.saveSettings(); }));
    }
    if (prov.type === 'anthropic' || prov.type === 'gemini-api') {
      new Setting(el).setName('API Key').addText(t => t.setValue(prov.apiKey).onChange(async v => { (this.plugin.settings.providers[i] as any).apiKey = v.trim(); await this.plugin.saveSettings(); }));
      new Setting(el).setName('Model').addText(t => t.setValue(prov.model).onChange(async v => { (this.plugin.settings.providers[i] as any).model = v.trim(); await this.plugin.saveSettings(); }));
    }
    new Setting(el).addButton(b => b.setButtonText('Remove provider').onClick(async () => {
      this.plugin.settings.providers.splice(i, 1);
      await this.plugin.saveSettings();
      this.display();
    }));
  }

  private renderRule(el: HTMLElement, rule: WatchRule, i: number): void {
    new Setting(el).setName(`Rule ${i + 1}`).setHeading();
    new Setting(el).setName('Watch folder').setDesc('Vault-relative. e.g. Inbox/screenshots').addText(t => t.setValue(rule.watchFolder).onChange(async v => { this.plugin.settings.rules[i].watchFolder = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('SOP / prompt path').setDesc('Absolute path to the markdown file with instructions.').addText(t => t.setValue(rule.sopPath).onChange(async v => { this.plugin.settings.rules[i].sopPath = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('Output folder').setDesc('Vault-relative. e.g. Notes/Aesthetic').addText(t => t.setValue(rule.outputFolder).onChange(async v => { this.plugin.settings.rules[i].outputFolder = v.trim(); await this.plugin.saveSettings(); }));
    new Setting(el).setName('Provider').addDropdown(d => {
      this.plugin.settings.providers.forEach(p => d.addOption(p.id, p.type === 'cli' ? `CLI: ${(p as any).cliType}` : (p as any).label || p.type));
      d.setValue(rule.providerId).onChange(async v => { this.plugin.settings.rules[i].providerId = v; await this.plugin.saveSettings(); });
    });
    new Setting(el).setName('Enabled').addToggle(t => t.setValue(rule.enabled).onChange(async v => { this.plugin.settings.rules[i].enabled = v; await this.plugin.saveSettings(); }));
    new Setting(el).addButton(b => b.setButtonText('Remove rule').onClick(async () => {
      this.plugin.settings.rules.splice(i, 1);
      await this.plugin.saveSettings();
      this.display();
    }));
  }
}
