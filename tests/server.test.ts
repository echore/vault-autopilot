import * as http from 'http';
import { createServer, ClipPayload } from '../src/server';

const PORT = 27191;

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
    handler = jest.fn().mockResolvedValue(undefined);
    server = createServer(PORT, handler);
    server.on('listening', done);
  });

  afterEach((done) => { server.close(done); });

  test('POST /clip calls handler and returns success', async () => {
    const payload: ClipPayload = { image_base64: 'abc', source_url: 'https://x.com', title: 'T' };
    const { status, body } = await request('POST', '/clip', payload);
    expect(status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(handler).toHaveBeenCalledWith(payload);
  });

  test('OPTIONS /clip returns 204 with CORS headers', async () => {
    const res = await fetch(`http://127.0.0.1:${PORT}/clip`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'chrome-extension://test' },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('chrome-extension://test');
  });

  test('handler error returns 500', async () => {
    handler.mockRejectedValue(new Error('disk error'));
    const { status, body } = await request('POST', '/clip', { image_base64: 'x', source_url: '', title: '' });
    expect(status).toBe(500);
    expect(body.error).toContain('disk error');
  });

  test('unknown route returns 404', async () => {
    const { status } = await request('GET', '/unknown');
    expect(status).toBe(404);
  });
});
