import { createGeminiAPIProvider } from '../../src/providers/gemini-api';
import { AnalysisRequest } from '../../src/types';

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
