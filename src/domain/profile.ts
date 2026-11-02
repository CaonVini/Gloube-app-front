/** Regras puras da tela "Meu perfil" (sem UI, sem rede). Todos os dados são fictícios e ficam só na memória do app. */

export interface ProfileStat { key: 'trips' | 'countries' | 'places'; value: number; label: string }
export interface PlanInfo { destinations: string; plan: string; billing: string; active: boolean }

export const DEMO_STATS: readonly ProfileStat[] = [
  { key: 'trips', value: 4, label: 'Viagens realizadas' },
  { key: 'countries', value: 3, label: 'Países visitados' },
  { key: 'places', value: 28, label: 'Lugares visitados' },
];

export const DEMO_PLAN: PlanInfo = { destinations: 'Paris e Roma', plan: 'Plano Premium', billing: 'Por viagem', active: true };

export const PLAN_BENEFITS: readonly string[] = [
  'Roteiro completo e personalizado com a Aurora',
  'Locais e horários sugeridos por dia',
  'Estimativa de orçamento por viagem',
  'Ajustes ilimitados no roteiro durante a viagem',
];

export type AccountRowKey = 'personal' | 'preferences' | 'notifications' | 'help';
export const ACCOUNT_ROWS: readonly { key: AccountRowKey; label: string }[] = [
  { key: 'personal', label: 'Dados pessoais' },
  { key: 'preferences', label: 'Preferências de viagem' },
  { key: 'notifications', label: 'Notificações' },
  { key: 'help', label: 'Ajuda e suporte' },
];

/** Ex.: "4 viagens realizadas" (rótulo de acessibilidade de cada número da faixa). */
export function statA11y(s: ProfileStat): string {
  return `${s.value} ${s.label.toLowerCase()}`;
}

/* ---------- Foto de perfil ---------- */

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
/** HEIC/HEIF ficam de fora: Android e web não renderizam; o seletor já converte para JPEG quando recorta/comprime. */
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
/** O seletor só devolve arquivos locais (file/content) ou blob/data de imagem (web). Qualquer outro esquema é recusado. */
const SAFE_URI = /^(file:\/\/|content:\/\/|blob:|data:image\/(jpeg|png|webp);base64,)/i;

export type AvatarCheck = { ok: true } | { ok: false; reason: string };

export function validateAvatar(a: { uri?: string | null; mimeType?: string | null; fileSize?: number | null }): AvatarCheck {
  if (!a.uri || !SAFE_URI.test(a.uri)) return { ok: false, reason: 'Não consegui abrir essa imagem. Tente outra.' };
  const type = a.mimeType?.toLowerCase();
  if (type && !(AVATAR_TYPES as readonly string[]).includes(type)) {
    return { ok: false, reason: 'Formato não suportado. Use uma foto JPG, PNG ou WebP.' };
  }
  if (a.fileSize != null && a.fileSize > MAX_AVATAR_BYTES) {
    return { ok: false, reason: `A foto é grande demais (máx. ${MAX_AVATAR_BYTES / 1024 / 1024} MB).` };
  }
  return { ok: true };
}

/* ---------- Nome ---------- */

export const MIN_NAME = 2;
export const MAX_NAME = 60;
// Letras (qualquer idioma), marcas de acento, espaço, apóstrofo, hífen e ponto. Sem dígitos, símbolos ou invisíveis.
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M} '.\-’]*$/u;

/** Remove caracteres de controle/direção invisíveis, colapsa espaços e apara. */
export function sanitizeName(raw: string): string {
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type NameCheck = { ok: true; value: string } | { ok: false; reason: string };

export function validateName(raw: string): NameCheck {
  const value = sanitizeName(raw);
  if (value.length < MIN_NAME) return { ok: false, reason: `Digite pelo menos ${MIN_NAME} letras.` };
  if (value.length > MAX_NAME) return { ok: false, reason: `Use no máximo ${MAX_NAME} caracteres.` };
  if (!NAME_RE.test(value)) return { ok: false, reason: 'Use apenas letras, espaços, hífen e apóstrofo.' };
  return { ok: true, value };
}

export function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
