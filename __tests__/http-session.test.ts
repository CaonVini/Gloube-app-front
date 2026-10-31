import { SessionManager } from '../src/application/session-manager';
import { ApiError, HttpClient } from '../src/infra/http/http-client';
import { MemoryTokenStorage } from '../src/infra/storage/token-storage';
import { resolveApiUrl } from '../src/config/env';
import { validateAddress, emptyAddressForm, validatePhone, validatePassword } from '../src/domain/validators';

const json = (status: number, body?: unknown) =>
  ({ status, ok: status < 400, json: async () => body }) as unknown as Response;

function setup(handler: (url: string, init: RequestInit) => Promise<Response>, refresh?: (rt: string) => Promise<any>) {
  const storage = new MemoryTokenStorage();
  const expired = jest.fn();
  const refreshFn = jest.fn(refresh ?? (async () => ({ accessToken: 'A2', refreshToken: 'R2' })));
  const session = new SessionManager(storage, refreshFn, expired);
  const fetchImpl = jest.fn(handler) as unknown as typeof fetch;
  const http = new HttpClient('http://api/v1', session, 1000, fetchImpl);
  return { storage, expired, refreshFn, session, http, fetchImpl: fetchImpl as unknown as jest.Mock };
}

describe('refresh automático em 401', () => {
  it('renova uma vez e repete a requisição com o novo token', async () => {
    const { session, http, fetchImpl, refreshFn } = setup(async (_u, init) => {
      const auth = (init.headers as Record<string, string>).Authorization;
      return auth === 'Bearer A2' ? json(200, { ok: 1 }) : json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } });
    });
    await session.setTokens({ accessToken: 'A1', refreshToken: 'R1' });
    await expect(http.request('/users/me', { auth: true })).resolves.toEqual({ ok: 1 });
    expect(refreshFn).toHaveBeenCalledWith('R1');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(session.getRefreshToken()).toBe('R2');
  });

  it('single-flight: 5 requisições simultâneas com 401 geram UM refresh', async () => {
    const { session, http, refreshFn } = setup(async (_u, init) =>
      (init.headers as Record<string, string>).Authorization === 'Bearer A2' ? json(200, {}) : json(401, {}),
    );
    await session.setTokens({ accessToken: 'A1', refreshToken: 'R1' });
    await Promise.all(Array.from({ length: 5 }, () => http.request('/users/me', { auth: true })));
    expect(refreshFn).toHaveBeenCalledTimes(1);
  });

  it('refresh rejeitado (401) limpa a sessão e avisa a UI', async () => {
    const { session, http, expired, storage } = setup(
      async () => json(401, { error: { code: 'UNAUTHORIZED', message: 'x' } }),
      async () => { throw new ApiError(401, 'UNAUTHORIZED', 'Refresh token inválido'); },
    );
    await session.setTokens({ accessToken: 'A1', refreshToken: 'R1' });
    await expect(http.request('/users/me', { auth: true })).rejects.toMatchObject({ status: 401 });
    expect(expired).toHaveBeenCalled();
    expect(await storage.load()).toBeNull();
  });

  it('falha de rede no refresh NÃO apaga os tokens', async () => {
    const { session, http, expired } = setup(
      async () => json(401, {}),
      async () => { throw new ApiError(0, 'NETWORK_ERROR', 'offline'); },
    );
    await session.setTokens({ accessToken: 'A1', refreshToken: 'R1' });
    await expect(http.request('/users/me', { auth: true })).rejects.toMatchObject({ status: 0 });
    expect(expired).not.toHaveBeenCalled();
    expect(session.getRefreshToken()).toBe('R1');
  });

  it('401 de login (sem auth) não dispara refresh', async () => {
    const { http, refreshFn } = setup(async () => json(401, { error: { code: 'UNAUTHORIZED', message: 'Credenciais inválidas' } }));
    await expect(http.request('/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({ message: 'Credenciais inválidas' });
    expect(refreshFn).not.toHaveBeenCalled();
  });
});

describe('resolveApiUrl', () => {
  it('usa 10.0.2.2 no Android e acrescenta /v1', () => {
    expect(resolveApiUrl('http://localhost:3333', 'android')).toBe('http://10.0.2.2:3333/v1');
    expect(resolveApiUrl('http://127.0.0.1:3333/', 'android')).toBe('http://10.0.2.2:3333/v1');
  });
  it('mantém localhost no iOS/web e IPs de LAN no Android', () => {
    expect(resolveApiUrl(undefined, 'ios')).toBe('http://localhost:3333/v1');
    expect(resolveApiUrl('http://192.168.0.5:3333', 'android')).toBe('http://192.168.0.5:3333/v1');
    expect(resolveApiUrl('https://api.x.com/v1', 'web')).toBe('https://api.x.com/v1');
  });
});

describe('validators', () => {
  it('telefone com máscara', () => {
    expect(validatePhone('(11) 99999-8888')).toBeUndefined();
    expect(validatePhone('123')).toBeDefined();
  });
  it('senha curta e endereço vazio', () => {
    expect(validatePassword('1234567')).toBeDefined();
    expect(Object.keys(validateAddress(emptyAddressForm())).length).toBe(5);
  });
});
