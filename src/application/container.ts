import { env } from '../config/env';
import { AuthApi, UsersApi } from '../infra/api/auth-api';
import { HttpClient } from '../infra/http/http-client';
import { createTokenStorage } from '../infra/storage/token-storage';
import { SessionManager } from './session-manager';

type ExpiredListener = () => void;
let onExpired: ExpiredListener = () => {};
export const setSessionExpiredListener = (fn: ExpiredListener) => {
  onExpired = fn;
};

/** Composição das dependências (um único lugar que conhece as implementações concretas). */
const anonHttp = new HttpClient(env.apiUrl);
export const authApi = new AuthApi(anonHttp);

export const session = new SessionManager(
  createTokenStorage(),
  async (rt) => authApi.refresh(rt),
  () => onExpired(),
);

export const usersApi = new UsersApi(new HttpClient(env.apiUrl, session));
