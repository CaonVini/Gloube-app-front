import { authColors } from '../theme/auth-theme';

/** Tokens visuais do chat (identidade Gloube: verde escuro, teal e creme). */
export const cc = {
  bg: '#F8F5F0',
  dark: authColors.primary, // #1F3D36
  teal: authColors.link, // #1B7F8C
  sent: authColors.primary,
  sentText: '#FFFFFF',
  sentMeta: 'rgba(255,255,255,0.7)',
  received: '#FFFFFF',
  receivedText: authColors.body,
  meta: '#8B9692',
  border: '#ECE9E3',
  danger: authColors.danger,
} as const;

export const MAX_COLUMN = 512;
