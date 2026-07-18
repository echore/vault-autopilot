import * as http from 'http';
import { createServer, ClipPayload } from '../src/server';

const PORT = 17999;

async function request(method: string, urlPath: string, body?: unknown): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`http://127.0.0.1:${PORT}${urlPath}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

describe('createServer', () => {
  let server: http.Server;
  let handler: jest.Mock;

  beforeEach((done) => {
    handler = jest.fn().mockResolvedValue({});
    server = createServer(PORT, handler, '0.1.0');
    server.on('listening', done);
  });

  afterEach((done) => { server.close(done); });

  test('POST /clip calls handler and returns success', async () => {
    const payload: ClipPayload = { mode: 'screenshot', images: ['abc'], url: 'https://x.com', title: 'T' };
    const { status, body } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip includes obsidianUrl when handler returns one', async () => {
    handler.mockResolvedValue({ obsidianUrl: 'obsidian://open?vault=V&file=Notes%2Ffoo.md' });
    const { status, body } = await request('POST', '/clip', { mode: 'screenshot', images: ['abc'], url: '', title: 'T' });
    expect(status).toBe(200);
    expect(body).toEqual({ success: true, obsidianUrl: 'obsidian://open?vault=V&file=Notes%2Ffoo.md' });
  });

  test('OPTIONS /clip returns 204 with CORS headers', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/clip`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'chrome-extension://test' },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://test');
  });

  test('handler error returns generic 500', async () => {
    handler.mockRejectedValue(new Error('disk error'));
    const { status, body } = await request('POST', '/clip', { mode: 'screenshot', images: ['x'], url: '', title: '' });
    expect(status).toBe(500);
    expect(body.error).toBe('Save failed');
  });

  test('invalid body returns 400', async () => {
    const { status, body } = await request('POST', '/clip', { mode: 'nope' });
    expect(status).toBe(400);
    expect(body.success).toBe(false);
  });

  test('unknown route returns 404', async () => {
    const { status } = await request('GET', '/unknown');
    expect(status).toBe(404);
  });

  test('POST /clip with new screenshot payload calls handler', async () => {
    const payload = { mode: 'screenshot', images: ['abc'], url: 'https://x.com', title: 'Test' };
    const { status, body } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip with hook payload calls handler', async () => {
    const payload = {
      mode: 'hook',
      frames: ['ZnJhbWUx', 'ZnJhbWUy'],
      video_title: 'My Hook',
      url: 'https://yt.com',
      captured_at: '2026-05-30T18:00:00Z',
    };
    const { status } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('POST /clip with keyframe payload calls handler', async () => {
    const payload = {
      mode: 'keyframe',
      frames: ['ZnJhbWUx'],
      video_title: 'My Video',
      url: 'https://yt.com',
      time_range: { start: 0, end: 15 },
      captured_at: '2026-05-30T18:00:00Z',
    };
    const { status } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('GET /ping returns app identity and version', async () => {
    const { status, body } = await request('GET', '/ping');
    expect(status).toBe(200);
    expect(body).toEqual({ app: 'vault-autopilot', version: '0.1.0' });
  });

  test('GET /ping sets CORS header for extension origin', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/ping`, {
      headers: { 'Origin': 'chrome-extension://test' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://test');
    expect(res.headers.get('access-control-allow-methods')).toContain('GET');
  });
});
