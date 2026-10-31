/**
 * Configuração vinda de variáveis EXPO_PUBLIC_* (embutidas no bundle em build time).
 * ATENÇÃO: tudo aqui é PÚBLICO — nunca coloque segredos (ex.: FACEBOOK_APP_SECRET) em EXPO_PUBLIC_*.
 */
import { Platform } from 'react-native';

const DEFAULT_API_URL = 'http://localhost:3333';

/**
 * Resolve a URL base da API (sem barra final e já com /v1).
 * No emulador Android, "localhost" aponta para o próprio emulador; o host da máquina é 10.0.2.2.
 * Em celular físico, defina EXPO_PUBLIC_API_URL com o IP da máquina na rede (ex.: http://192.168.0.10:3333).
 */
export function resolveApiUrl(raw: string | undefined, os: string): string {
  let url = (raw && raw.trim() ? raw.trim() : DEFAULT_API_URL).replace(/\/+$/, '');
  if (os === 'android') {
    url = url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/i, '$110.0.2.2');
  }
  return url.endsWith('/v1') ? url : `${url}/v1`;
}

export const env = {
  apiUrl: resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, Platform.OS),
  google: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  },
  facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
} as const;
