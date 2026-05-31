import { createAnthropicProvider } from '../../src/providers/anthropic';
import { AnalysisRequest, MultiFrameRequest } from '../../src/types';

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

describe('analyzeMultiFrame — Anthropic', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    mockCreate = jest.fn().mockResolvedValue({
      content: [{ type: 'text', text: '# Hook Analysis\nContent' }],
    });
    MockAnthropic.mockImplementation(() => ({ messages: { create: mockCreate } }) as any);
  });

  const multiFrameReq: MultiFrameRequest = {
    frames: [Buffer.from('frame1'), Buffer.from('frame2')],
    transcript: 'Hello world',
    sopContent: 'Analyze the hook.',
    meta: { video_title: 'My Hook', channel: 'TestChan', url: 'https://yt.com', captured_at: '2026-05-30T18:00:00Z' },
  };

  test('returns trimmed text from response', async () => {
    const p = createAnthropicProvider(config);
    const result = await (p as any).analyzeMultiFrame(multiFrameReq);
    expect(result).toBe('# Hook Analysis\nContent');
  });

  test('sends each frame as a separate image content block', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    const imageBlocks = userContent.filter((c: any) => c.type === 'image');
    expect(imageBlocks).toHaveLength(2);
    expect(imageBlocks[0].source.data).toBe(Buffer.from('frame1').toString('base64'));
    expect(imageBlocks[1].source.data).toBe(Buffer.from('frame2').toString('base64'));
  });

  test('includes transcript in context text block', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    const userContent = call.messages.find((m: any) => m.role === 'user').content;
    const textBlock = userContent.find((c: any) => c.type === 'text');
    expect(textBlock.text).toContain('Hello world');
  });

  test('uses sopContent as system prompt', async () => {
    const p = createAnthropicProvider(config);
    await (p as any).analyzeMultiFrame(multiFrameReq);
    const call = mockCreate.mock.calls[0][0];
    expect(call.system).toBe('Analyze the hook.');
  });

  test('throws when response has no text block', async () => {
    mockCreate.mockResolvedValue({ content: [] });
    const p = createAnthropicProvider(config);
    await expect((p as any).analyzeMultiFrame(multiFrameReq)).rejects.toThrow('no text');
  });
});

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
