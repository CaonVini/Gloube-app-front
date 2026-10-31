import { Image } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const logo = require('../../../assets/images/logo-white.png');

// Logo principal da Gloube (branco), rasterizado a 4x a partir do SVG de marca (624x154 px).
// PNG em vez de SVG: evita dependência nativa (react-native-svg) que não carregava no Expo Go.
const ASPECT = 110.67 / 449.02;

export function GloubeLogo({ width = 140 }: { width?: number }) {
  return (
    <Image
      source={logo}
      style={{ width, height: width * ASPECT }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Gloube"
    />
  );
}
