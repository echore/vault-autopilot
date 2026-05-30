import OpenAI from 'openai';
import { AIProvider, AnalysisRequest, OpenAICompatProviderConfig } from '../types';

function imageToDataUrl(buf: Buffer): string {
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export function createOpenAICompatProvider(config: OpenAICompatProviderConfig): AIProvider {
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
            { type: 'image_url' as const, image_url: { url: imageToDataUrl(req.fileContent) } },
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
  };
}

function buildTextContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  if (req.fileType === 'text') parts.push(`\nFile content:\n${req.fileContent.toString('utf8')}`);
  return parts.join('\n') || 'Analyze the attached file.';
}
