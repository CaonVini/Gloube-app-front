export interface Address {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: Address | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: Tokens & { tokenType: 'Bearer'; expiresIn: number };
  isNewUser?: boolean;
}

export type SocialProvider = 'google' | 'facebook';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: Address;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  address?: Address | null;
}
