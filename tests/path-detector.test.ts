import * as fs from 'fs';
import { detectBinaryPath, KNOWN_PATHS } from '../src/path-detector';

jest.mock('fs');
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

describe('detectBinaryPath', () => {
  beforeEach(() => { mockExistsSync.mockReturnValue(false); });

  test('returns configured path if it exists', () => {
    mockExistsSync.mockImplementation((p) => p === '/custom/claude');
    expect(detectBinaryPath('claude', '/custom/claude')).toBe('/custom/claude');
  });

  test('returns first known path that exists when configured path not given', () => {
    const knownPath = KNOWN_PATHS['claude'][0];
    mockExistsSync.mockImplementation((p) => p === knownPath);
    expect(detectBinaryPath('claude', '')).toBe(knownPath);
  });

  test('returns binary name as fallback when nothing found', () => {
    expect(detectBinaryPath('claude', '')).toBe('claude');
  });

  test('KNOWN_PATHS has entries for claude, gemini, codex', () => {
    expect(KNOWN_PATHS['claude'].length).toBeGreaterThan(0);
    expect(KNOWN_PATHS['gemini'].length).toBeGreaterThan(0);
    expect(KNOWN_PATHS['codex'].length).toBeGreaterThan(0);
  });
});
