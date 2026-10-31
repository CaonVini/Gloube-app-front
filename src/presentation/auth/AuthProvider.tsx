import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, session, setSessionExpiredListener, usersApi } from '../../application/container';
import type { AuthResult, RegisterInput, SocialProvider, UpdateProfileInput, User } from '../../domain/types';
import { ApiError } from '../../infra/http/http-client';

type Status = 'loading' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextValue {
  status: Status;
  user: User | null;
  login(email: string, password: string): Promise<void>;
  register(input: RegisterInput): Promise<void>;
  loginWithSocial(provider: SocialProvider, token: string): Promise<void>;
  logout(): Promise<void>;
  updateProfile(input: UpdateProfileInput): Promise<void>;
  retryBoot(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [bootTry, setBootTry] = useState(0);

  // Refresh token rejeitado pelo servidor => volta para o login.
  useEffect(() => {
    setSessionExpiredListener(() => {
      setUser(null);
      setStatus('unauthenticated');
    });
  }, []);

  // Restaura a sessão do armazenamento seguro ao abrir o app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        if (!(await session.load())) return !cancelled && setStatus('unauthenticated');
        const me = await usersApi.me(); // renova automaticamente em 401
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      } catch (e) {
        if (cancelled) return;
        // Rede fora: mantém os tokens e permite tentar de novo. Outros erros: sessão inválida.
        if (e instanceof ApiError && e.isNetwork) return setStatus('error');
        await session.clear();
        setStatus('unauthenticated');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootTry]);

  const adopt = useCallback(async (r: AuthResult) => {
    await session.setTokens(r.tokens);
    setUser(r.user);
    setStatus('authenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (email, password) => adopt(await authApi.login(email, password)),
      register: async (input) => adopt(await authApi.register(input)),
      loginWithSocial: async (provider, token) => adopt(await authApi.social(provider, token)),
      logout: async () => {
        const rt = session.getRefreshToken();
        // Limpa localmente primeiro: o usuário sai mesmo se a rede falhar; revogação é best-effort.
        await session.clear();
        setUser(null);
        setStatus('unauthenticated');
        if (rt) await authApi.logout(rt).catch(() => {});
      },
      updateProfile: async (input) => setUser(await usersApi.update(input)),
      retryBoot: () => setBootTry((n) => n + 1),
    }),
    [status, user, adopt],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

/** Mensagem amigável para exibir ao usuário (sem vazar detalhes internos). */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) {
    if (e.isNetwork) return e.message;
    if (e.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.';
    if (e.status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
    return e.message;
  }
  return 'Algo deu errado. Tente novamente.';
}
