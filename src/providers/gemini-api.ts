import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AnalysisRequest, GeminiAPIProviderConfig } from '../types';

export function createGeminiAPIProvider(config: GeminiAPIProviderConfig): AIProvider {
  const genAI = new GoogleGenerativeAI(config.apiKey);

  return {
    id: config.id,
    name: `Gemini API (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const model = genAI.getGenerativeModel({ model: config.model });
      const parts: any[] = [{ text: req.sopContent + '\n\n' + buildContext(req) }];

      if (req.fileType === 'image') {
        parts.push({ inlineData: { mimeType: 'image/png', data: req.fileContent.toString('base64') } });
      } else {
        parts[0].text += `\n\nFile content:\n${req.fileContent.toString('utf8')}`;
      }

      const result = await model.generateContent(parts);
      return result.response.text().trim();
    },
  };
}

function buildContext(req: AnalysisRequest): string {
  const parts: string[] = [];
  if (req.meta.source_url) parts.push(`Source URL: ${req.meta.source_url}`);
  if (req.meta.title) parts.push(`Title: ${req.meta.title}`);
  return parts.join('\n');
}
