/** Tokens visuais das telas de autenticação (identidade Gloube). */
export const authColors = {
  card: '#F8F5F0',
  surface: '#FFFFFF',
  primary: '#1F3D36',
  primaryText: '#FFFFFF',
  link: '#1B7F8C',
  text: '#1F3D36',
  body: '#2B2F2E',
  muted: '#6F7773',
  placeholder: '#8A918E',
  border: '#D6D9D7',
  danger: '#B3261E',
  overlay: 'rgba(0,0,0,0.35)',
} as const;

/** Famílias carregadas via expo-font (instâncias estáticas geradas da Inter variável). */
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
} as const;

export const fontAssets = {
  [fonts.regular]: require('../../../assets/fonts/Inter-Regular.ttf'),
  [fonts.medium]: require('../../../assets/fonts/Inter-Medium.ttf'),
  [fonts.semibold]: require('../../../assets/fonts/Inter-SemiBold.ttf'),
  [fonts.bold]: require('../../../assets/fonts/Inter-Bold.ttf'),
};

export const radius = { card: 28, field: 9 } as const;
