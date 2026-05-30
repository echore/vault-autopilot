import { createOpenAICompatProvider } from '../../src/providers/openai-compat';
import { AnalysisRequest } from '../../src/types';

// Mock the openai module
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    })),
  };
});

import OpenAI from 'openai';
const MockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

const config = {
  id: 'p1', type: 'openai-compat' as const,
  label: 'OpenRouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: 'sk-or-test',
  model: 'openai/gpt-4o',
};

const imageRequest: AnalysisRequest = {
  filePath: '/tmp/test.png',
  fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  sopContent: 'Analyze the image.',
  meta: { source_url: 'https://example.com', title: 'Test' },
};

const textRequest: AnalysisRequest = {
  filePath: '/tmp/note.md',
  fileType: 'text',
  fileContent: Buffer.from('# My Note\nHello world'),
  sopContent: 'Summarize the text.',
  meta: {},
};

describe('createOpenAICompatProvider', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      choices: [{ message: { content: '# Generated Note\nContent here' } }],
    });
    MockOpenAI.mockImplementation(() => ({ chat: { completions: { create: mockCreate } } }) as any);
  });

  test('id and name are set', () => {
    const p = createOpenAICompatProvider(config);
    expect(p.id).toBe('p1');
    expect(p.name).toContain('OpenRouter');
  });

  test('image request sends base64 image_url message', async () => {
    const p = createOpenAICompatProvider(config);
    const result = await p.analyze(imageRequest);
    expect(result).toBe('# Generated Note\nContent here');
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    expect(Array.isArray(userContent)).toBe(true);
    expect(userContent.some((c: any) => c.type === 'image_url')).toBe(true);
  });

  test('text request sends content as text', async () => {
    const p = createOpenAICompatProvider(config);
    await p.analyze(textRequest);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    expect(typeof userContent === 'string' || userContent.some((c: any) => c.type === 'text')).toBe(true);
  });

  test('throws when API returns no content', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const p = createOpenAICompatProvider(config);
    await expect(p.analyze(imageRequest)).rejects.toThrow('no content');
  });

  test('initialises OpenAI client with correct baseURL', () => {
    createOpenAICompatProvider(config);
    expect(MockOpenAI).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-or-test',
    }));
  });
});
