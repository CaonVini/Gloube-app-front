import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEMO_USER, type DemoUser } from '../../domain/demo-user';

interface DemoSessionValue {
  signedIn: boolean;
  user: DemoUser;
  signIn(): void;
  signOut(): void;
}

const DemoSessionContext = createContext<DemoSessionValue | null>(null);

/**
 * Sessão fictícia, apenas em memória: não grava token, não chama API e some ao fechar o app.
 * Existe só para o fluxo de demonstração; para religar a API, troque por useAuth() (presentation/auth).
 */
export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const value = useMemo<DemoSessionValue>(
    () => ({ signedIn, user: DEMO_USER, signIn: () => setSignedIn(true), signOut: () => setSignedIn(false) }),
    [signedIn],
  );
  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession(): DemoSessionValue {
  const ctx = useContext(DemoSessionContext);
  if (!ctx) throw new Error('useDemoSession deve ser usado dentro de DemoSessionProvider');
  return ctx;
}
