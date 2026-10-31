import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { Tokens } from '../../domain/types';

export interface TokenStorage {
  load(): Promise<Tokens | null>;
  save(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}

const ACCESS_KEY = 'aurora.accessToken';
const REFRESH_KEY = 'aurora.refreshToken';

/** Keychain (iOS) / Keystore (Android). Sem backup/migração entre aparelhos. */
export class SecureTokenStorage implements TokenStorage {
  private readonly opts = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

  async load(): Promise<Tokens | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY, this.opts),
      SecureStore.getItemAsync(REFRESH_KEY, this.opts),
    ]);
    return accessToken && refreshToken ? { accessToken, refreshToken } : null;
  }

  async save(t: Tokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, t.accessToken, this.opts),
      SecureStore.setItemAsync(REFRESH_KEY, t.refreshToken, this.opts),
    ]);
  }

  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY, this.opts),
      SecureStore.deleteItemAsync(REFRESH_KEY, this.opts),
    ]);
  }
}

/**
 * Web não tem armazenamento seguro (localStorage é legível por qualquer XSS).
 * Por isso, na web os tokens ficam só em memória: a sessão se perde ao recarregar a página.
 * Serve para testar no navegador; o alvo real do app é mobile.
 */
export class MemoryTokenStorage implements TokenStorage {
  private tokens: Tokens | null = null;
  async load() { return this.tokens; }
  async save(t: Tokens) { this.tokens = t; }
  async clear() { this.tokens = null; }
}

export const createTokenStorage = (): TokenStorage =>
  Platform.OS === 'web' ? new MemoryTokenStorage() : new SecureTokenStorage();
