import { ClipPayload } from './server';

export class ClipValidationError extends Error {
  constructor(message: string) { super(message); this.name = 'ClipValidationError'; }
}

const MODES = ['thumbnail', 'screenshot', 'hook', 'keyframe'] as const;

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

// Validate + normalize an untrusted /clip body. Throws ClipValidationError with
// a message safe to return to the client (no internal paths or stack traces).
export function validateClipPayload(raw: unknown): ClipPayload {
  if (typeof raw !== 'object' || raw === null) {
    throw new ClipValidationError('Body must be a JSON object');
  }
  const p = raw as Record<string, unknown>;
  if (typeof p.mode !== 'string' || !MODES.includes(p.mode as typeof MODES[number])) {
    throw new ClipValidationError('Unknown or missing clip mode');
  }

  if (p.mode === 'screenshot') {
    if (!isStringArray(p.images)) {
      if (typeof p.image === 'string') { p.images = [p.image]; delete p.image; }
      else throw new ClipValidationError('screenshot requires images[]');
    }
    if (typeof p.url !== 'string' || typeof p.title !== 'string') {
      throw new ClipValidationError('screenshot requires url and title');
    }
    return p as unknown as ClipPayload;
  }

  if (p.mode === 'thumbnail') {
    if (typeof p.video_id !== 'string' || typeof p.thumbnail_url !== 'string' || typeof p.video_url !== 'string') {
      throw new ClipValidationError('thumbnail requires video_id, thumbnail_url, video_url');
    }
    return p as unknown as ClipPayload;
  }

  // hook | keyframe
  if (!isStringArray(p.frames)) throw new ClipValidationError(`${p.mode} requires frames[]`);
  if (typeof p.url !== 'string') throw new ClipValidationError(`${p.mode} requires url`);
  if (!(typeof p.video_title === 'string' || p.video_title === null || p.video_title === undefined)) {
    throw new ClipValidationError('video_title must be a string or null');
  }
  return p as unknown as ClipPayload;
}
