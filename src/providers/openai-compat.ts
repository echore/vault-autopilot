import OpenAI from 'openai';
import { AIProvider, AnalysisRequest, OpenAICompatProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';

function imageToDataUrl(buf: Buffer, filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
  const mime: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
  return `data:${mime[ext] ?? 'image/png'};base64,${buf.toString('base64')}`;
}

export function createOpenAICompatProvider(config: OpenAICompatProviderConfig): MultiFrameProvider {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
    dangerouslyAllowBrowser: true, // required in Electron environment
  });

  return {
    id: config.id,
    name: `${config.label} (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const systemPrompt = req.sopContent;

      const userContent = req.fileType === 'image'
        ? [
            { type: 'text' as const, text: buildTextContext(req) },
            { type: 'image_url' as const, image_url: { url: imageToDataUrl(req.fileContent, req.filePath) } },
          ]
        : buildTextContext(req);

      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 4096,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('API returned no content');
      return content.trim();
    },

    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const imageContent = req.frames.map((frame) => ({
        type: 'image_url' as const,
        image_url: { url: `data:image/png;base64,${frame.toString('base64')}` },
      }));
      const response = await client.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: req.sopContent },
          { role: 'user', content: [...imageContent, { type: 'text' as const, text: buildMultiFrameContext(req) }] },
        ],
        max_tokens: 4096,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('API returned no content');
      return content.trim();
    },
  };
}

function buildTextContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  if (req.fileType === 'text') parts.push(`\nFile content:\n${req.fileContent.toString('utf8')}`);
  return parts.join('\n') || 'Analyze the attached file.';
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
