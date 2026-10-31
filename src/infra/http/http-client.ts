export class ApiError extends Error {
  constructor(
    public readonly status: number, // 0 = falha de rede/timeout
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
  get isNetwork() {
    return this.status === 0;
  }
}

/** Contrato que o HttpClient exige da camada de sessão (inversão de dependência). */
export interface TokenProvider {
  getAccessToken(): string | null;
  /**
   * Chamado ao receber 401. `failedToken` é o access token que foi rejeitado: permite
   * reaproveitar um token já renovado por outra requisição, sem gastar outro refresh.
   * Retorna o novo access token, ou null se a sessão não pôde ser renovada.
   */
  refreshAccessToken(failedToken: string | null): Promise<string | null>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Envia Authorization e tenta refresh em 401. Padrão: false. */
  auth?: boolean;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly tokens?: TokenProvider,
    private readonly timeoutMs = 15_000,
    private readonly fetchImpl: typeof fetch = (...a) => fetch(...a),
  ) {}

  async request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const useAuth = opts.auth === true && this.tokens !== undefined;
    const sent = useAuth ? this.tokens!.getAccessToken() : null;

    let res = await this.send(path, opts, sent);
    if (res.status === 401 && useAuth) {
      const fresh = await this.tokens!.refreshAccessToken(sent);
      if (fresh) res = await this.send(path, opts, fresh); // uma única retentativa
    }
    return this.parse<T>(res);
  }

  private async send(path: string, opts: RequestOptions, token: string | null): Promise<Response> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      return await this.fetchImpl(`${this.baseUrl}${path}`, {
        method: opts.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
        signal: ctrl.signal,
      });
    } catch (e) {
      const timedOut = ctrl.signal.aborted;
      throw new ApiError(
        0,
        timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
        timedOut ? 'A requisição demorou demais' : 'Sem conexão com o servidor',
        e,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private async parse<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    let data: unknown = null;
    try {
      data = await res.json();
    } catch {
      /* corpo vazio ou não-JSON */
    }
    if (res.ok) return data as T;
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? `Erro ${res.status}`, err?.details);
  }
}
