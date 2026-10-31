/**
 * Validação local (UX) dos formulários de login/cadastro. Pura e sem dependência de React/rede,
 * para ser reutilizada quando a API for religada. O servidor continua sendo a fonte de verdade.
 */
import { validateEmail, validateName, validatePassword, type FieldErrors } from './validators';

export type LoginValues = { email: string; password: string };
export type RegisterValues = { name: string; email: string; password: string; acceptedTerms: boolean };

export function validateLogin(v: LoginValues): FieldErrors<keyof LoginValues> {
  const e: FieldErrors<keyof LoginValues> = {};
  const email = validateEmail(v.email);
  if (email) e.email = email;
  if (!v.password) e.password = 'Informe a senha';
  return e;
}

export function validateRegister(v: RegisterValues): FieldErrors<keyof RegisterValues> {
  const e: FieldErrors<keyof RegisterValues> = {};
  const name = validateName(v.name);
  const email = validateEmail(v.email);
  const password = validatePassword(v.password);
  if (name) e.name = name;
  if (email) e.email = email;
  if (password) e.password = password;
  if (!v.acceptedTerms) e.acceptedTerms = 'Aceite os termos para continuar';
  return e;
}
