import { authColors } from '../theme/auth-theme';

/** Tokens da tela Meu perfil (identidade Gloube: verde escuro, teal e creme). */
export const pc = {
  bg: '#F8F5F0',
  card: '#FFFFFF',
  border: '#ECE9E3',
  dark: authColors.primary, // #1F3D36
  teal: authColors.link, // #1B7F8C
  body: authColors.body,
  muted: authColors.muted,
  chipBg: '#DCEBDD',
  badgeBg: '#E4EDE6',
  danger: authColors.danger,
  overlay: authColors.overlay,
} as const;

export const MAX_COLUMN = 512;
export const H_PADDING = 20;
