import OpenAI from 'openai';
import { FrameSelectorSettings } from './types';

// Robustly turn the model's reply into exactly `count` valid, distinct indices.
// Extract numbers, keep in-range/distinct ones, then pad from the unused indices
// (in order) so we always return a usable selection even if the model misbehaves.
export function parseSelection(text: string, count: number, total: number): number[] {
  const seen = new Set<number>();
  const keep: number[] = [];
  for (const m of text.match(/\d+/g) ?? []) {
    const n = Number(m);
    if (n >= 0 && n < total && !seen.has(n)) {
      seen.add(n); keep.push(n);
      if (keep.length >= count) break;
    }
  }
  for (let i = 0; i < total && keep.length < count; i++) {
    if (!seen.has(i)) { seen.add(i); keep.push(i); }
  }
  return keep;
}

const PROMPTS: Record<string, string> = {
  hook: '这些是一个视频开头的候选帧。请挑出最抓眼球、最有视觉冲击或动效的画面，避开纯黑场和静止的口播人脸定格。',
  keyframe: '这些是一段视频的候选帧。请挑出动效、转场、运镜或动作最明显的画面，避开纯人脸定格和几乎静止的画面。',
};

// Ask the vision model which `count` frames to keep. Throws on any failure so the
// caller can fall back to a heuristic selection.
export async function selectFrames(
  frames: Buffer[],
  count: number,
  mode: string,
  cfg: FrameSelectorSettings,
): Promise<number[]> {
  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseUrl, dangerouslyAllowBrowser: true });
  const labelled = frames.flatMap((f, i) => [
    { type: 'text' as const, text: `[${i}]` },
    { type: 'image_url' as const, image_url: { url: `data:image/jpeg;base64,${f.toString('base64')}` } },
  ]);
  const prompt = `${PROMPTS[mode] ?? PROMPTS.keyframe}\n每张图前面都有编号 [n]。从中选出最好的 ${count} 张，只返回 JSON：{"keep":[编号,...]}，不要任何其它文字。`;
  const resp = await client.chat.completions.create({
    model: cfg.model,
    messages: [{ role: 'user', content: [...labelled, { type: 'text' as const, text: prompt }] }],
    max_tokens: 200,
  });
  const text = resp.choices[0]?.message?.content ?? '';
  return parseSelection(text, count, frames.length);
}
