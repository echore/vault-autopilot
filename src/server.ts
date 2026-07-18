import * as http from 'http';
import { validateClipPayload, ClipValidationError } from './clip-validate';

export type ScreenshotPayload = {
  mode: 'screenshot';
  images: string[];
  image?: string;       // legacy single-shot field; normalized to images[] on ingest
  url: string;
  title: string;
  cover_url?: string;
};

export type HookPayload = {
  mode: 'hook';
  frames: string[];
  transcript?: string;
  video_title: string | null;
  channel?: string;
  platform?: string;
  url: string;
  captured_at: string;
  time_range?: { start: number; end: number };
  cover_url?: string;
  frames_select?: number;
};

export type KeyframePayload = {
  mode: 'keyframe';
  frames: string[];
  video_title: string | null;
  url: string;
  time_range: { start: number; end: number };
  captured_at: string;
  cover_url?: string;
  frames_select?: number;
};

export type ThumbnailPayload = {
  mode: 'thumbnail';
  platform: string;
  video_id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  source_name?: string;
  channel?: string | null;
  channel_handle?: string | null;
  views?: string | null;
  captured_at: string;
  published_at?: string;
};

export type ClipPayload =
  | ThumbnailPayload
  | ScreenshotPayload
  | HookPayload
  | KeyframePayload;

// Returns an obsidian:// deep link to the created/updated note (optional) and
// a notice string when a section was skipped (e.g. already exists).
export type ClipHandler = (payload: ClipPayload) => Promise<{ obsidianUrl?: string; notice?: string }>;

export function createServer(port: number, onClip: ClipHandler, version = ''): http.Server {
  const server = http.createServer((req, res) => {
    const origin = req.headers['origin'] || '';
    if (origin.startsWith('chrome-extension://')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'GET' && req.url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ app: 'vault-autopilot', version }));
      return;
    }

    if (req.method !== 'POST' || req.url !== '/clip') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
      return;
    }

    let body = '';
    let bodySize = 0;
    const MAX_BODY = 20 * 1024 * 1024; // 20 MB
    req.on('data', (chunk) => {
      bodySize += chunk.length;
      if (bodySize > MAX_BODY) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payload too large' }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', async () => {
      let payload: ClipPayload;
      try {
        payload = validateClipPayload(JSON.parse(body));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err instanceof ClipValidationError ? err.message : 'Invalid request body' }));
        return;
      }
      try {
        const { obsidianUrl, notice } = await onClip(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...(obsidianUrl ? { obsidianUrl } : {}), ...(notice ? { notice } : {}) }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Save failed' }));
      }
    });
  });

  server.listen(port, '127.0.0.1');
  return server;
}
