/**
 * Validações de UX (espelham as regras do backend). NÃO substituem a validação do servidor,
 * que continua sendo a fonte de verdade.
 */
import type { Address } from './types';

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[1-9]\d{9,14}$/;
const ZIP_RE = /^[0-9A-Za-z -]{4,15}$/;

export const normalizePhone = (v: string) => v.replace(/[\s().-]/g, '');

export function validateEmail(v: string): string | undefined {
  const t = v.trim();
  if (!t) return 'Informe o e-mail';
  if (t.length > 254 || !EMAIL_RE.test(t)) return 'E-mail inválido';
  return undefined;
}

export function validatePassword(v: string): string | undefined {
  if (v.length < 8) return 'A senha deve ter pelo menos 8 caracteres';
  if (v.length > 128) return 'A senha deve ter no máximo 128 caracteres';
  return undefined;
}

export function validateName(v: string): string | undefined {
  const t = v.trim();
  if (t.length < 2) return 'Informe o nome';
  if (t.length > 120) return 'Nome muito longo';
  return undefined;
}

export function validatePhone(v: string): string | undefined {
  if (!PHONE_RE.test(normalizePhone(v))) return 'Telefone inválido (use DDD, ex.: (11) 99999-8888)';
  return undefined;
}

export type AddressForm = Record<
  'street' | 'number' | 'complement' | 'neighborhood' | 'city' | 'state' | 'zipCode',
  string
>;

export const emptyAddressForm = (): AddressForm => ({
  street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '',
});

export function validateAddress(a: AddressForm): FieldErrors<keyof AddressForm> {
  const e: FieldErrors<keyof AddressForm> = {};
  if (!a.street.trim()) e.street = 'Informe a rua';
  if (!a.number.trim()) e.number = 'Informe o número';
  if (!a.city.trim()) e.city = 'Informe a cidade';
  if (a.state.trim().length < 2) e.state = 'Informe o estado (UF)';
  if (!ZIP_RE.test(a.zipCode.trim())) e.zipCode = 'CEP inválido';
  return e;
}

/** Converte o formulário (strings) no payload da API, omitindo campos opcionais vazios. */
export function toAddress(a: AddressForm): Address {
  const opt = (v: string) => (v.trim() ? v.trim() : undefined);
  return {
    street: a.street.trim(),
    number: a.number.trim(),
    complement: opt(a.complement),
    neighborhood: opt(a.neighborhood),
    city: a.city.trim(),
    state: a.state.trim(),
    zipCode: a.zipCode.trim(),
    country: 'BR',
  };
}

export function fromAddress(a: Address | null): AddressForm {
  if (!a) return emptyAddressForm();
  return {
    street: a.street, number: a.number, complement: a.complement ?? '',
    neighborhood: a.neighborhood ?? '', city: a.city, state: a.state, zipCode: a.zipCode,
  };
}
