import { spawn } from 'child_process';
import { createCLIProvider } from '../../src/providers/cli-base';
import { AnalysisRequest } from '../../src/types';

jest.mock('child_process');
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

function makeMockProc(stdout: string, stderr: string, code: number | null, signal: string | null = null) {
  const proc: any = {
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
  };
  proc.stdout.on.mockImplementation((ev: string, cb: (d: Buffer) => void) => {
    if (ev === 'data') cb(Buffer.from(stdout));
  });
  proc.stderr.on.mockImplementation((ev: string, cb: (d: Buffer) => void) => {
    if (ev === 'data') cb(Buffer.from(stderr));
  });
  proc.on.mockImplementation((ev: string, cb: (code: number | null, signal: string | null) => void) => {
    if (ev === 'close') cb(code, signal);
  });
  mockSpawn.mockReturnValue(proc);
  return proc;
}

const baseRequest: AnalysisRequest = {
  filePath: '/tmp/test.png',
  fileType: 'image',
  fileContent: Buffer.from('fake'),
  sopContent: '# SOP\nAnalyze the image.',
  meta: { source_url: 'https://example.com', title: 'Test' },
};

describe('createCLIProvider (claude)', () => {
  const provider = createCLIProvider({
    id: 'p1', type: 'cli', cliType: 'claude', bin: 'claude',
  });

  beforeEach(() => mockSpawn.mockClear());

  test('id and name are set', () => {
    expect(provider.id).toBe('p1');
    expect(provider.name).toContain('claude');
  });

  test('resolves with markdown on success', async () => {
    makeMockProc('some preamble\n```markdown\n# Note\ncontent\n```', '', 0);
    const result = await provider.analyze(baseRequest);
    expect(result).toContain('# Note');
    expect(mockSpawn).toHaveBeenCalledWith(
      'claude',
      expect.arrayContaining(['-p']),
      expect.objectContaining({ timeout: 300_000 }),
    );
  });

  test('resolves with raw stdout when no markdown block', async () => {
    makeMockProc('plain output without code block', '', 0);
    const result = await provider.analyze(baseRequest);
    expect(result).toBe('plain output without code block');
  });

  test('throws on non-zero exit', async () => {
    makeMockProc('', 'auth error', 1);
    await expect(provider.analyze(baseRequest)).rejects.toThrow('auth error');
  });

  test('throws timeout message when killed by signal', async () => {
    makeMockProc('', '', null, 'SIGTERM');
    await expect(provider.analyze(baseRequest)).rejects.toThrow('claude timed out after 300s');
  });

  test('throws spawn error when binary not found', async () => {
    const proc: any = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn(),
    };
    proc.stdout.on.mockImplementation(() => {});
    proc.stderr.on.mockImplementation(() => {});
    proc.on.mockImplementation((ev: string, cb: (err: Error) => void) => {
      if (ev === 'error') cb(new Error('spawn claude ENOENT'));
    });
    mockSpawn.mockReturnValue(proc);
    await expect(provider.analyze(baseRequest)).rejects.toThrow('spawn claude ENOENT');
  });
});

describe('createCLIProvider (gemini)', () => {
  const provider = createCLIProvider({
    id: 'p2', type: 'cli', cliType: 'gemini', bin: 'gemini',
  });

  beforeEach(() => mockSpawn.mockClear());

  test('uses -p flag', async () => {
    makeMockProc('gemini output', '', 0);
    await provider.analyze(baseRequest);
    const [bin, args] = mockSpawn.mock.calls[0];
    expect(bin).toBe('gemini');
    expect(args).toContain('-p');
  });
});

describe('createCLIProvider (codex)', () => {
  const provider = createCLIProvider({
    id: 'p3', type: 'cli', cliType: 'codex', bin: 'codex',
  });

  beforeEach(() => mockSpawn.mockClear());

  test('uses --prompt flag', async () => {
    makeMockProc('codex output', '', 0);
    await provider.analyze(baseRequest);
    const [bin, args] = mockSpawn.mock.calls[0];
    expect(bin).toBe('codex');
    expect(args).toContain('--prompt');
  });
});
