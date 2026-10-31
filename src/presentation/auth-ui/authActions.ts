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

/**
 * Ações do fluxo fictício: qualquer entrada/cadastro (inclusive social) apenas "abre" a sessão de demonstração.
 * Não há validação de credenciais no servidor nem persistência; as validações de formulário continuam na UI.
 */
export function createDemoAuthActions(signIn: () => void): AuthActions {
  const enter = async () => signIn();
  return { ...stubAuthActions, login: enter, register: enter, loginWithGoogle: enter, loginWithFacebook: enter };
}
