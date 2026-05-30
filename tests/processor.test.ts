import * as fs from 'fs';
import * as path from 'path';
import { processFile, isSupportedFileType, readFileAsBuffer } from '../src/processor';
import { AIProvider, WatchRule } from '../src/types';

jest.mock('fs');
const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

const mockProvider: AIProvider = {
  id: 'p1', name: 'Mock',
  analyze: jest.fn().mockResolvedValue('# Generated Note\nContent'),
};

const rule: WatchRule = {
  id: 'r1', enabled: true,
  watchFolder: 'Inbox/screenshots',
  sopPath: '/vault/.obsidian/plugins/vault-autopilot/sop/test.md',
  outputFolder: 'Notes/Output',
  providerId: 'p1',
};

describe('isSupportedFileType', () => {
  test('accepts image extensions', () => {
    expect(isSupportedFileType('photo.png')).toBe(true);
    expect(isSupportedFileType('img.jpg')).toBe(true);
    expect(isSupportedFileType('anim.gif')).toBe(true);
    expect(isSupportedFileType('photo.webp')).toBe(true);
  });

  test('accepts text extensions', () => {
    expect(isSupportedFileType('note.md')).toBe(true);
    expect(isSupportedFileType('log.txt')).toBe(true);
  });

  test('rejects unsupported types', () => {
    expect(isSupportedFileType('video.mp4')).toBe(false);
    expect(isSupportedFileType('doc.pdf')).toBe(false);
    expect(isSupportedFileType('data.csv')).toBe(false);
  });
});

describe('processFile', () => {
  beforeEach(() => {
    mockReadFileSync.mockImplementation((filePath) => {
      if (String(filePath).endsWith('.md') || String(filePath).endsWith('sop')) return Buffer.from('# SOP\nDo analysis.');
      return Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG magic
    });
    mockExistsSync.mockReturnValue(true);
  });

  test('calls provider.analyze with correct request', async () => {
    await processFile('/vault/Inbox/screenshots/test.png', rule, mockProvider, {});
    expect(mockProvider.analyze).toHaveBeenCalledWith(expect.objectContaining({
      filePath: '/vault/Inbox/screenshots/test.png',
      fileType: 'image',
      sopContent: expect.stringContaining('SOP'),
    }));
  });

  test('returns markdown string from provider', async () => {
    const result = await processFile('/vault/Inbox/screenshots/test.png', rule, mockProvider, {});
    expect(result).toBe('# Generated Note\nContent');
  });

  test('passes meta when provided', async () => {
    await processFile('/vault/Inbox/test.png', rule, mockProvider, { source_url: 'https://x.com', title: 'T' });
    expect(mockProvider.analyze).toHaveBeenCalledWith(expect.objectContaining({
      meta: { source_url: 'https://x.com', title: 'T' },
    }));
  });

  test('throws when SOP file does not exist', async () => {
    mockExistsSync.mockImplementation((p) => !String(p).endsWith('test.md'));
    await expect(processFile('/vault/test.png', { ...rule, sopPath: '/missing/test.md' }, mockProvider, {}))
      .rejects.toThrow('SOP file not found');
  });
});
