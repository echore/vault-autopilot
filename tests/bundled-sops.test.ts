import * as fs from 'fs';
import * as path from 'path';
import { builtinSopFor, exportBuiltinSop, SopInstallOps } from '../src/bundled-sops';

function makeOps(existing: string[] = []) {
  const created: Record<string, string> = {};
  const ops: SopInstallOps = {
    fileExists: (p) => existing.includes(p) || p in created,
    ensureFolder: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(async (p: string, c: string) => { created[p] = c; }),
  };
  return { ops, created };
}

describe('builtinSopFor', () => {
  test('cover, hook, and keyframe have built-ins in both languages', () => {
    for (const mode of ['thumbnail', 'hook', 'keyframe'] as const)
      for (const lang of ['zh', 'en'] as const)
        expect(builtinSopFor(mode, lang)).toBeTruthy();
  });
  test('screenshot has no built-in SOP', () => {
    expect(builtinSopFor('screenshot', 'zh')).toBeUndefined();
    expect(builtinSopFor('screenshot', 'en')).toBeUndefined();
  });
});

describe('exportBuiltinSop', () => {
  test('writes the copy under <base>/SOPs and reports its path', async () => {
    const { ops, created } = makeOps();
    const r = await exportBuiltinSop(ops, 'Clips', 'hook', 'zh');
    expect(r).toEqual({ path: 'Clips/SOPs/视频Hook分析 SOP.md', existed: false });
    expect(created['Clips/SOPs/视频Hook分析 SOP.md']).toBeTruthy();
    expect(ops.ensureFolder).toHaveBeenCalledWith('Clips/SOPs');
  });
  test('never overwrites: existing file reports existed and keeps content', async () => {
    const { ops, created } = makeOps(['Clips/SOPs/视频Hook分析 SOP.md']);
    const r = await exportBuiltinSop(ops, 'Clips', 'hook', 'zh');
    expect(r).toEqual({ path: 'Clips/SOPs/视频Hook分析 SOP.md', existed: true });
    expect(created['Clips/SOPs/视频Hook分析 SOP.md']).toBeUndefined();
    expect(ops.create).not.toHaveBeenCalled();
  });
  test('empty base falls back to Clips; language picks the filename', async () => {
    const { ops } = makeOps();
    const r = await exportBuiltinSop(ops, '', 'thumbnail', 'en');
    expect(r?.path).toBe('Clips/SOPs/Cover Analysis SOP.md');
  });
  test('screenshot mode returns undefined and writes nothing', async () => {
    const { ops } = makeOps();
    expect(await exportBuiltinSop(ops, 'Clips', 'screenshot', 'zh')).toBeUndefined();
    expect(ops.create).not.toHaveBeenCalled();
  });
});

describe('bundled SOP source files', () => {
  // jest maps .md imports to a stub, so inspect the real files on disk.
  const sopDir = path.join(__dirname, '..', 'src', 'sops');
  const files = (['zh', 'en'] as const).flatMap(lang =>
    fs.readdirSync(path.join(sopDir, lang)).map(f => path.join(sopDir, lang, f)));

  test('six files ship, three per language', () => {
    expect(files).toHaveLength(6);
  });
  test('no personal vault frontmatter remains', () => {
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      expect({ file: path.basename(f), startsWithFrontmatter: content.startsWith('---') })
        .toEqual({ file: path.basename(f), startsWithFrontmatter: false });
      expect(content).not.toContain('permalink:');
    }
  });
  test('english files carry no em or en dashes', () => {
    for (const f of files.filter(f => f.includes('/en/'))) {
      const content = fs.readFileSync(f, 'utf8');
      expect({ file: path.basename(f), hasDash: /[—–]/.test(content) })
        .toEqual({ file: path.basename(f), hasDash: false });
    }
  });
});
