import { requestUrl } from 'obsidian';
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
  hook: '这些是一个视频开头的候选帧。请挑出画面上图形/文字/动效元素最丰富、最抓眼球的画面；务必挑彼此差异大的，绝不要选几乎一样或同一镜头的两张；能避开纯人脸定格就避开。',
  keyframe: '这些是一段视频的候选帧。请挑出动效、转场、图形、文字或动作最明显的画面；务必挑彼此差异大的，绝不要选几乎一样或同一镜头的两张；能避开纯人脸定格、静止画面就避开。',
};

// Ask the vision model which `count` frames to keep. Uses Obsidian's requestUrl so
// the Authorization header is sent reliably (the OpenAI SDK's fetch drops it in the
// Electron renderer). Throws on any failure so the caller can fall back.
export async function selectFrames(
  frames: Buffer[],
  count: number,
  mode: string,
  cfg: FrameSelectorSettings,
): Promise<number[]> {
  const labelled = frames.flatMap((f, i) => [
    { type: 'text', text: `[${i}]` },
    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${f.toString('base64')}` } },
  ]);
  const prompt = `${PROMPTS[mode] ?? PROMPTS.keyframe}\n每张图前面都有编号 [n]。从中选出最好的 ${count} 张，只返回 JSON：{"keep":[编号,...]}，不要任何其它文字。`;
  const url = cfg.baseUrl.replace(/\/+$/, '') + '/chat/completions';
  const resp = await requestUrl({
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({
      model: cfg.model,
      messages: [{ role: 'user', content: [...labelled, { type: 'text', text: prompt }] }],
      max_tokens: 200,
    }),
  });
  const text: string = resp.json?.choices?.[0]?.message?.content ?? '';
  return parseSelection(text, count, frames.length);
}
