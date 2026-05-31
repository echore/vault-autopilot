import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AnalysisRequest, GeminiAPIProviderConfig, MultiFrameRequest, MultiFrameProvider } from '../types';

function imageMimeType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  };
  return map[ext] ?? 'image/png';
}

export function createGeminiAPIProvider(config: GeminiAPIProviderConfig): MultiFrameProvider {
  const genAI = new GoogleGenerativeAI(config.apiKey);

  return {
    id: config.id,
    name: `Gemini API (${config.model})`,

    async analyze(req: AnalysisRequest): Promise<string> {
      const model = genAI.getGenerativeModel({ model: config.model });
      const parts: any[] = [{ text: req.sopContent + '\n\n' + buildContext(req) }];

      if (req.fileType === 'image') {
        parts.push({ inlineData: { mimeType: imageMimeType(req.filePath), data: req.fileContent.toString('base64') } });
      } else {
        parts[0].text += `\n\nFile content:\n${req.fileContent.toString('utf8')}`;
      }

      const result = await model.generateContent(parts);
      return result.response.text().trim();
    },

    async analyzeMultiFrame(req: MultiFrameRequest): Promise<string> {
      const model = genAI.getGenerativeModel({ model: config.model });
      const parts: any[] = [
        ...req.frames.map((frame) => ({
          inlineData: { mimeType: 'image/png', data: frame.toString('base64') },
        })),
        { text: req.sopContent + '\n\n' + buildMultiFrameContext(req) },
      ];
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
