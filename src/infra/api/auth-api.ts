import type { HttpClient } from '../http/http-client';
import type { AuthResult, RegisterInput, SocialProvider, Tokens, UpdateProfileInput, User } from '../../domain/types';

/** Cliente tipado dos endpoints /v1 (sem regra de negócio). */
export class AuthApi {
  constructor(private readonly anon: HttpClient) {}

  register(input: RegisterInput) {
    return this.anon.request<AuthResult>('/auth/register', { method: 'POST', body: input });
  }
  login(email: string, password: string) {
    return this.anon.request<AuthResult>('/auth/login', { method: 'POST', body: { email: email.trim(), password } });
  }
  social(provider: SocialProvider, token: string) {
    return this.anon.request<AuthResult>('/auth/social', { method: 'POST', body: { provider, token } });
  }
  refresh(refreshToken: string) {
    return this.anon.request<Tokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });
  }
  logout(refreshToken: string) {
    return this.anon.request<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
  }
}

export class UsersApi {
  constructor(private readonly authed: HttpClient) {}

  me() {
    return this.authed.request<User>('/users/me', { auth: true });
  }
  update(input: UpdateProfileInput) {
    return this.authed.request<User>('/users/me', { method: 'PATCH', body: input, auth: true });
  }
}
