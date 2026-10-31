import { useEffect, useRef, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { env } from '../../config/env';
import type { SocialProvider } from '../../domain/types';

WebBrowser.maybeCompleteAuthSession();

interface SocialLogin {
  /** false quando as variáveis EXPO_PUBLIC_* do provedor não foram configuradas. */
  enabled: boolean;
  start(): void;
}

/**
 * Obtém o token do provedor no dispositivo e o entrega ao callback; quem o envia à API
 * (/auth/social) é o AuthProvider. O app nunca vê senha do Google/Facebook.
 */
export function useSocialLogin(provider: SocialProvider, onToken: (token: string) => void): SocialLogin {
  const cb = useRef(onToken);
  cb.current = onToken;

  // O hook do Google LANÇA exceção se nenhum clientId existir; como hooks não podem ser condicionais,
  // usamos um placeholder e deixamos `enabled=false` (botão desabilitado) quando não configurado.
  const PLACEHOLDER = 'not-configured';
  // Hooks de ambos os provedores são chamados sempre (regra dos hooks); só um é usado.
  const [gReq, gRes, gPrompt] = Google.useIdTokenAuthRequest({
    webClientId: env.google.webClientId ?? PLACEHOLDER,
    iosClientId: env.google.iosClientId ?? PLACEHOLDER,
    androidClientId: env.google.androidClientId ?? PLACEHOLDER,
  });
  const [fReq, fRes, fPrompt] = Facebook.useAuthRequest({ clientId: env.facebookAppId ?? PLACEHOLDER });

  const [handled, setHandled] = useState<unknown>(null);
  useEffect(() => {
    const res = provider === 'google' ? gRes : fRes;
    if (!res || res === handled || res.type !== 'success') return;
    setHandled(res);
    const token = provider === 'google' ? res.params?.id_token : res.authentication?.accessToken;
    if (token) cb.current(token);
  }, [provider, gRes, fRes, handled]);

  const configured =
    provider === 'google'
      ? Boolean(env.google.webClientId || env.google.iosClientId || env.google.androidClientId)
      : Boolean(env.facebookAppId);

  return {
    enabled: configured && Boolean(provider === 'google' ? gReq : fReq),
    start: () => void (provider === 'google' ? gPrompt() : fPrompt()),
  };
}
