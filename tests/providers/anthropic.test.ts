import { createAnthropicProvider } from '../../src/providers/anthropic';
import { AnalysisRequest } from '../../src/types';

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: jest.fn() },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

const config = { id: 'a1', type: 'anthropic' as const, apiKey: 'sk-ant-test', model: 'claude-sonnet-4-6' };

const req: AnalysisRequest = {
  filePath: '/tmp/test.png', fileType: 'image',
  fileContent: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  sopContent: 'Analyze the image.', meta: {},
};

describe('createAnthropicProvider', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: '# Note\nContent' }],
    });
    MockAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } }) as any);
  });

  test('returns text from response', async () => {
    const p = createAnthropicProvider(config);
    const result = await p.analyze(req);
    expect(result).toBe('# Note\nContent');
  });

  test('sends image as base64 source block', async () => {
    const p = createAnthropicProvider(config);
    await p.analyze(req);
    const call = mockCreate.mock.calls[0][0];
    const userMsg = call.messages.find((m: any) => m.role === 'user');
    expect(userMsg.content.some((c: any) => c.type === 'image')).toBe(true);
  });

  test('throws when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    await expect(createAnthropicProvider(config).analyze(req)).rejects.toThrow('no text');
  });
});
