import { createGeminiAPIProvider } from '../../src/providers/gemini-api';
import { AnalysisRequest, MultiFrameRequest } from '../../src/types';

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn(),
    }),
  })),
  HarmCategory: {},
  HarmBlockThreshold: {},
}));

import { GoogleGenerativeAI } from '@google/generative-ai';
const MockGAI = GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>;

const config = { id: 'g1', type: 'gemini-api' as const, apiKey: 'gai-test', model: 'gemini-1.5-flash' };

const req: AnalysisRequest = {
  filePath: '/tmp/img.png', fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50]),
  sopContent: 'Analyze.', meta: {},
};

describe('analyzeMultiFrame — Gemini', () => {
  let mockGenerateContent: jest.Mock;

  beforeEach(() => {
    mockGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => '# Keyframe Analysis\nContent' },
    });
    MockGAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({ generateContent: mockGenerateContent }),
    }) as any);
  });

  const multiFrameReq: MultiFrameRequest = {
    frames: [Buffer.from('frame1'), Buffer.from('frame2')],
    sopContent: 'Analyze the keyframes.',
    meta: { video_title: 'My Video', url: 'https://yt.com', time_range: { start: 0, end: 15 }, captured_at: '2026-05-30T18:00:00Z' },
  };

  test('returns trimmed text from response', async () => {
    const p = createGeminiAPIProvider(config);
    const result = await (p as any).analyzeMultiFrame(multiFrameReq);
    expect(result).toBe('# Keyframe Analysis\nContent');
  });

  test('sends each frame as a separate inlineData part', async () => {
    const p = createGeminiAPIProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const parts = mockGenerateContent.mock.calls[0][0];
    const inlineDataParts = parts.filter((p: any) => p.inlineData);
    expect(inlineDataParts).toHaveLength(2);
    expect(inlineDataParts[0].inlineData.mimeType).toBe('image/png');
    expect(inlineDataParts[0].inlineData.data).toBe(Buffer.from('frame1').toString('base64'));
  });

  test('includes sop and context in the text part', async () => {
    const p = createGeminiAPIProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const parts = mockGenerateContent.mock.calls[0][0];
    const textPart = parts.find((p: any) => p.text);
    expect(textPart.text).toContain('Analyze the keyframes.');
    expect(textPart.text).toContain('My Video');
  });
});

describe('createGeminiAPIProvider', () => {
  let mockGenerate: jest.Mock;

  beforeEach(() => {
    mockGenerate = jest.fn().mockResolvedValue({
      response: { text: () => '# Gemini Note' },
    });
    MockGAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({ generateContent: mockGenerate }),
    }) as any);
  });

  test('returns generated text', async () => {
    const result = await createGeminiAPIProvider(config).analyze(req);
    expect(result).toBe('# Gemini Note');
  });

  test('sends image as inline data part', async () => {
    await createGeminiAPIProvider(config).analyze(req);
    const parts = mockGenerate.mock.calls[0][0];
    expect(parts.some((p: any) => p.inlineData)).toBe(true);
  });
});
