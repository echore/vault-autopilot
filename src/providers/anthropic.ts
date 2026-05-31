import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AnalysisRequest, AnthropicProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';

function imageMimeType(filePath: string): 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  };
  return map[ext] ?? 'image/png';
}

export function createAnthropicProvider(config: AnthropicProviderConfig): MultiFrameProvider {
  const client = new Anthropic({ apiKey: config.apiKey });

  return {
    id: config.id,
    name: `Anthropic (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const userContent: any[] = req.fileType === 'image'
        ? [
            { type: 'image', source: { type: 'base64', media_type: imageMimeType(req.filePath), data: req.fileContent.toString('base64') } },
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

    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const imageBlocks: any[] = req.frames.map((frame) => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/png', data: frame.toString('base64') },
      }));
      const response = await client.messages.create({
        model: config.model,
        max_tokens: 4096,
        system: req.sopContent,
        messages: [{
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: buildMultiFrameContext(req) }],
        }],
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

function buildMultiFrameContext(req: MultiFrameRequest): string {
  const parts: string[] = [];
  if (req.meta.video_title) parts.push(`Video: ${req.meta.video_title}`);
  if (req.meta.channel) parts.push(`Channel: ${req.meta.channel}`);
  if (req.meta.platform) parts.push(`Platform: ${req.meta.platform}`);
  if (req.meta.url) parts.push(`URL: ${req.meta.url}`);
  if (req.meta.time_range) parts.push(`Time range: ${req.meta.time_range.start}s–${req.meta.time_range.end}s`);
  if (req.meta.captured_at) parts.push(`Captured: ${req.meta.captured_at}`);
  if (req.transcript) parts.push(`\nTranscript:\n${req.transcript}`);
  return parts.join('\n') || 'Analyze the frames.';
}
