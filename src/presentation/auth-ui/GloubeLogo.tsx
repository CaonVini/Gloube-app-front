import { Image } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logos = {
  white: require('../../../assets/images/logo-white.png'),
  dark: require('../../../assets/images/logo-dark.png'),
};

// Logo principal da Gloube (branco ou escuro, mesma arte recolorida), rasterizado a 4x a partir do SVG de marca (624x154 px).
// PNG em vez de SVG: evita dependência nativa (react-native-svg) que não carregava no Expo Go.
const ASPECT = 110.67 / 449.02;

export function GloubeLogo({ width = 140, tone = 'white' }: { width?: number; tone?: 'white' | 'dark' }) {
  return (
    <Image
      source={logos[tone]}
      style={{ width, height: width * ASPECT }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Gloube"
    />
  );
}
