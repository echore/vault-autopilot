import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AnalysisRequest, AnthropicProviderConfig } from '../types';

export function createAnthropicProvider(config: AnthropicProviderConfig): AIProvider {
  const client = new Anthropic({ apiKey: config.apiKey });

  return {
    id: config.id,
    name: `Anthropic (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const userContent: any[] = req.fileType === 'image'
        ? [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: req.fileContent.toString('base64') } },
            { type: 'text', text: buildContext(req) },
          ]
        : [{ type: 'text', text: `${buildContext(req)}\n\n${req.fileContent.toString('utf8')}` }];

      const response = await client.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: req.sopContent,
        messages: [{ role: 'user', content: userContent }],
      });

      const textBlock = response.content.find((b: any) => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') throw new Error('Anthropic returned no text block');
      return (textBlock as any).text.trim();
    },
  };
}

function buildContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  return parts.join('\n') || 'Analyze the file.';
}
