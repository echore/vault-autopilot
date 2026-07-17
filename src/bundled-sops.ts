import coverZh from './sops/zh/封面拆解学习 SOP.md';
import hookZh from './sops/zh/视频Hook分析 SOP.md';
import keyframeZh from './sops/zh/视频关键帧分析 SOP.md';
import coverEn from './sops/en/Cover Analysis SOP.md';
import hookEn from './sops/en/Video Hook Analysis SOP.md';
import keyframeEn from './sops/en/Video Keyframe Analysis SOP.md';

export interface BundledSop { filename: string; content: string; }

export interface SopInstallOps {
  fileExists(path: string): boolean;
  ensureFolder(path: string): Promise<void>;
  create(path: string, content: string): Promise<void>;
}

export const BUNDLED_SOPS: BundledSop[] = [
  { filename: '封面拆解学习 SOP.md', content: coverZh },
  { filename: '视频Hook分析 SOP.md', content: hookZh },
  { filename: '视频关键帧分析 SOP.md', content: keyframeZh },
  { filename: 'Cover Analysis SOP.md', content: coverEn },
  { filename: 'Video Hook Analysis SOP.md', content: hookEn },
  { filename: 'Video Keyframe Analysis SOP.md', content: keyframeEn },
];

// Writes bundled SOPs into <base>/SOPs. Existing files are never overwritten,
// and no sopPath setting is touched: the user picks which SOP applies where.
export async function installBundledSops(
  ops: SopInstallOps, baseFolder: string, sops: BundledSop[] = BUNDLED_SOPS,
): Promise<{ written: string[]; skipped: string[] }> {
  const folder = `${(baseFolder || 'Clips').trim().replace(/\/+$/, '') || 'Clips'}/SOPs`;
  await ops.ensureFolder(folder);
  const written: string[] = [];
  const skipped: string[] = [];
  for (const s of sops) {
    const path = `${folder}/${s.filename}`;
    if (ops.fileExists(path)) { skipped.push(path); continue; }
    await ops.create(path, s.content);
    written.push(path);
  }
  return { written, skipped };
}
