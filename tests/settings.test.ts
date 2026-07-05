import { DEFAULT_SETTINGS, normalizePort } from '../src/settings';

describe('port migration', () => {
  test('default port is 17183', () => {
    expect(DEFAULT_SETTINGS.httpServer.port).toBe(17183);
  });
  test('legacy default 27183 migrates to 17183', () => {
    expect(normalizePort(27183)).toBe(17183);
  });
  test('user-customized port is preserved', () => {
    expect(normalizePort(9999)).toBe(9999);
  });
  test('missing port falls back to default', () => {
    expect(normalizePort(undefined)).toBe(17183);
  });
});
