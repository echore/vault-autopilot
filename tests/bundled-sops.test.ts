import { installBundledSops, BUNDLED_SOPS, BundledSop, SopInstallOps } from '../src/bundled-sops';

function makeOps(existing: string[] = []) {
  const created: Record<string, string> = {};
  const ops: SopInstallOps = {
    fileExists: (p) => existing.includes(p) || p in created,
    ensureFolder: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(async (p: string, c: string) => { created[p] = c; }),
  };
  return { ops, created };
}

const sops: BundledSop[] = [
  { filename: 'A.md', content: 'aaa' },
  { filename: 'B.md', content: 'bbb' },
];

describe('installBundledSops', () => {
  test('writes every bundled file under <base>/SOPs', async () => {
    const { ops, created } = makeOps();
    const r = await installBundledSops(ops, 'Clips', sops);
    expect(r.written).toEqual(['Clips/SOPs/A.md', 'Clips/SOPs/B.md']);
    expect(r.skipped).toEqual([]);
    expect(created['Clips/SOPs/A.md']).toBe('aaa');
    expect(ops.ensureFolder).toHaveBeenCalledWith('Clips/SOPs');
  });
  test('never overwrites an existing file', async () => {
    const { ops, created } = makeOps(['Clips/SOPs/A.md']);
    const r = await installBundledSops(ops, 'Clips', sops);
    expect(r.written).toEqual(['Clips/SOPs/B.md']);
    expect(r.skipped).toEqual(['Clips/SOPs/A.md']);
    expect(created['Clips/SOPs/A.md']).toBeUndefined();
  });
  test('empty base falls back to Clips', async () => {
    const { ops } = makeOps();
    const r = await installBundledSops(ops, '', sops);
    expect(r.written[0]).toBe('Clips/SOPs/A.md');
  });
  test('ships six bundled SOPs, three per language', () => {
    expect(BUNDLED_SOPS).toHaveLength(6);
    for (const s of BUNDLED_SOPS) expect(s.content.length).toBeGreaterThan(0);
  });
});
