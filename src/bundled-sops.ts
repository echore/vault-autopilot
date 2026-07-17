import coverZh from './sops/zh/封面拆解学习 SOP.md';
import hookZh from './sops/zh/视频Hook分析 SOP.md';
import keyframeZh from './sops/zh/视频关键帧分析 SOP.md';
import coverEn from './sops/en/Cover Analysis SOP.md';
import hookEn from './sops/en/Video Hook Analysis SOP.md';
import keyframeEn from './sops/en/Video Keyframe Analysis SOP.md';
import type { ClipMode } from './types';
import type { Language } from './i18n';

interface BuiltinSop { filename: string; content: string; }

// Screenshot mode has no built-in SOP on purpose: webpage screenshots are too
// varied for one analysis prompt; users attach their own via sopPath.
const BUILTIN: Partial<Record<ClipMode, Record<Language, BuiltinSop>>> = {
  thumbnail: {
    zh: { filename: '封面拆解学习 SOP.md', content: coverZh },
    en: { filename: 'Cover Analysis SOP.md', content: coverEn },
  },
  hook: {
    zh: { filename: '视频Hook分析 SOP.md', content: hookZh },
    en: { filename: 'Video Hook Analysis SOP.md', content: hookEn },
  },
  keyframe: {
    zh: { filename: '视频关键帧分析 SOP.md', content: keyframeZh },
    en: { filename: 'Video Keyframe Analysis SOP.md', content: keyframeEn },
  },
};

export function builtinSopFor(mode: ClipMode, language: Language): string | undefined {
  return BUILTIN[mode]?.[language]?.content;
}

export interface SopInstallOps {
  fileExists(path: string): boolean;
  ensureFolder(path: string): Promise<void>;
  create(path: string, content: string): Promise<void>;
}

// One-click fork: copy this mode's built-in SOP into <base>/SOPs (never
// overwriting) and return the vault-relative path so settings can point the
// mode's sopPath at it. Returns undefined for modes without a built-in SOP.
export async function exportBuiltinSop(
  ops: SopInstallOps, baseFolder: string, mode: ClipMode, language: Language,
): Promise<{ path: string; existed: boolean } | undefined> {
  const sop = BUILTIN[mode]?.[language];
  if (!sop) return undefined;
  const folder = `${(baseFolder || 'Clips').trim().replace(/\/+$/, '') || 'Clips'}/SOPs`;
  const path = `${folder}/${sop.filename}`;
  if (ops.fileExists(path)) return { path, existed: true };
  await ops.ensureFolder(folder);
  await ops.create(path, sop.content);
  return { path, existed: false };
}
