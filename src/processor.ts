import * as fs from 'fs';
import * as path from 'path';
import { AIProvider, AnalysisRequest, FileMeta, WatchRule } from './types';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const TEXT_EXTS  = new Set(['.md', '.txt']);

export function isSupportedFileType(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTS.has(ext) || TEXT_EXTS.has(ext);
}

export function readFileAsBuffer(filePath: string): Buffer {
  return fs.readFileSync(filePath) as Buffer;
}

export async function processFile(
  absoluteFilePath: string,
  rule: WatchRule,
  provider: AIProvider,
  meta: FileMeta,
): Promise<string> {
  if (!fs.existsSync(rule.sopPath)) {
    throw new Error(`SOP file not found: ${rule.sopPath}`);
  }

  const ext = path.extname(absoluteFilePath).toLowerCase();
  const fileType = IMAGE_EXTS.has(ext) ? 'image' : 'text';
  const fileContent = readFileAsBuffer(absoluteFilePath);
  const sopContent = fs.readFileSync(rule.sopPath, 'utf8').toString();

  const request: AnalysisRequest = { filePath: absoluteFilePath, fileType, fileContent, sopContent, meta };
  return provider.analyze(request);
}
