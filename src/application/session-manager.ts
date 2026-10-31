import type { Tokens } from '../domain/types';
import { ApiError, type TokenProvider } from '../infra/http/http-client';
import type { TokenStorage } from '../infra/storage/token-storage';

/**
 * Guarda os tokens (memória + armazenamento seguro) e renova o access token.
 *
 * Ponto crítico: o backend ROTACIONA o refresh token a cada uso e trata reuso como roubo
 * (revoga todas as sessões). Por isso o refresh é "single-flight": N requisições recebendo 401
 * ao mesmo tempo disparam UM único /auth/refresh e todas aguardam o mesmo resultado.
 */
export class SessionManager implements TokenProvider {
  private tokens: Tokens | null = null;
  private inflight: Promise<string | null> | null = null;

  constructor(
    private readonly storage: TokenStorage,
    private readonly refreshFn: (refreshToken: string) => Promise<Tokens>,
    private readonly onExpired: () => void = () => {},
  ) {}

  async load(): Promise<boolean> {
    this.tokens = await this.storage.load();
    return this.tokens !== null;
  }

  async setTokens(t: Tokens): Promise<void> {
    this.tokens = { accessToken: t.accessToken, refreshToken: t.refreshToken };
    await this.storage.save(this.tokens);
  }

  async clear(): Promise<void> {
    this.tokens = null;
    await this.storage.clear();
  }

  getAccessToken() {
    return this.tokens?.accessToken ?? null;
  }
  getRefreshToken() {
    return this.tokens?.refreshToken ?? null;
  }

  refreshAccessToken(failedToken: string | null): Promise<string | null> {
    // Outra requisição já renovou depois que esta foi enviada: basta reaproveitar.
    const current = this.tokens?.accessToken ?? null;
    if (current && current !== failedToken) return Promise.resolve(current);

    this.inflight ??= this.doRefresh().finally(() => {
      this.inflight = null;
    });
    return this.inflight;
  }

  private async doRefresh(): Promise<string | null> {
    const refreshToken = this.tokens?.refreshToken;
    if (!refreshToken) return null;
    try {
      const fresh = await this.refreshFn(refreshToken);
      await this.setTokens(fresh);
      return fresh.accessToken;
    } catch (e) {
      // Rejeição definitiva do servidor => sessão acabou. Falha de rede/5xx => mantém tokens.
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429) {
        await this.clear();
        this.onExpired();
        return null;
      }
      throw e;
    }
  }
}
