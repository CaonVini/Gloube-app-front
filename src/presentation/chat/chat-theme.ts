import { authColors } from '../theme/auth-theme';

/** Tokens visuais do chat (identidade Gloube: verde escuro, teal e creme). */
export const cc = {
  bg: '#F8F5F0',
  dark: authColors.primary, // #1F3D36
  teal: authColors.link, // #1B7F8C
  tealSoft: '#DDEEF0',
  tick: '#8FD3DB',
  mint: '#E4EDE6',
  sentText: '#FFFFFF',
  sentMeta: 'rgba(255,255,255,0.72)',
  received: '#FFFFFF',
  receivedText: authColors.body,
  meta: '#8B9692',
  border: '#ECE9E3',
  danger: authColors.danger,
  online: '#3BB273',
} as const;

export const MAX_COLUMN = 512;

/** Sombra suave dos cartões/bolhas brancas. */
export const softShadow = {
  shadowColor: '#1F3D36',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 2,
} as const;
