import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEMO_USER } from '../../domain/demo-user';
import { useDemoSession } from './DemoSession';

interface ProfileValue {
  name: string;
  email: string;
  /** URI local da foto escolhida (null = usa o avatar padrão do app). */
  photoUri: string | null;
  setName(name: string): void;
  setPhotoUri(uri: string | null): void;
}

const ProfileContext = createContext<ProfileValue | null>(null);

/**
 * Perfil fictício, só em memória: nome e foto editados ficam disponíveis no cabeçalho e na tela Meu perfil,
 * não são gravados em disco nem enviados a servidor e são descartados ao sair da conta.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { signedIn } = useDemoSession();
  const [name, setName] = useState(DEMO_USER.fullName);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) { setName(DEMO_USER.fullName); setPhotoUri(null); }
  }, [signedIn]);

  const setNameStable = useCallback((v: string) => setName(v), []);
  const value = useMemo<ProfileValue>(
    () => ({ name, email: DEMO_USER.email, photoUri, setName: setNameStable, setPhotoUri }),
    [name, photoUri, setNameStable],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile deve ser usado dentro de ProfileProvider');
  return ctx;
}
