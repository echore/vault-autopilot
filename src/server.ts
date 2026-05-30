import * as http from 'http';

export interface ClipPayload {
  image_base64: string;
  source_url: string;
  title: string;
}

export type ClipHandler = (payload: ClipPayload) => Promise<void>;

export function createServer(port: number, onClip: ClipHandler): http.Server {
  const server = http.createServer((req, res) => {
    const origin = req.headers['origin'] || '';
    if (origin.startsWith('chrome-extension://')) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

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
      try {
        const payload = JSON.parse(body) as ClipPayload;
        await onClip(payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: String(err) }));
      }
    });
  });

  server.listen(port, '127.0.0.1');
  return server;
}
