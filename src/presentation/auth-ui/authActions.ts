import type { LoginValues, RegisterValues } from '../../domain/auth-forms';

/**
 * Contrato entre as telas (UI pura) e a camada de autenticação.
 * Hoje as rotas usam `stubAuthActions` (sem rede). Para religar a API, crie um adaptador que implemente
 * esta interface sobre `useAuth()` (src/presentation/auth/AuthProvider) e passe-o às rotas em app/(auth).
 * As telas antigas, já ligadas à API, estão preservadas em src/presentation/auth/legacy.
 */
export interface AuthActions {
  login(values: LoginValues): Promise<void>;
  register(values: Omit<RegisterValues, 'acceptedTerms'>): Promise<void>;
  loginWithGoogle(): Promise<void>;
  loginWithFacebook(): Promise<void>;
  forgotPassword(): void;
  openTerms(): void;
  openPrivacy(): void;
}

const noop = async () => {};

/** Implementação provisória: não faz chamadas de rede nem guarda credenciais. */
export const stubAuthActions: AuthActions = {
  login: noop,
  register: noop,
  loginWithGoogle: noop,
  loginWithFacebook: noop,
  forgotPassword: () => {},
  openTerms: () => {},
  openPrivacy: () => {},
};
