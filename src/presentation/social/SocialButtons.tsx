import { useState } from 'react';
import type { SocialProvider } from '../../domain/types';
import { errorMessage, useAuth } from '../auth/AuthProvider';
import { Button, ErrorText } from '../components/ui';
import { useSocialLogin } from './useSocialLogin';

function SocialButton({ provider, label, onError }: { provider: SocialProvider; label: string; onError: (m: string) => void }) {
  const { loginWithSocial } = useAuth();
  const [busy, setBusy] = useState(false);
  const { enabled, start } = useSocialLogin(provider, async (token) => {
    setBusy(true);
    try {
      await loginWithSocial(provider, token); // sucesso => Stack.Protected troca para (app)
    } catch (e) {
      onError(errorMessage(e));
      setBusy(false);
    }
  });
  return <Button title={label} variant={provider} loading={busy} disabled={!enabled} onPress={start} />;
}

export function SocialButtons() {
  const [error, setError] = useState<string>();
  return (
    <>
      <SocialButton provider="google" label="Continuar com Google" onError={setError} />
      <SocialButton provider="facebook" label="Continuar com Facebook" onError={setError} />
      <ErrorText>{error}</ErrorText>
    </>
  );
}
