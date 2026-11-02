import { Image, type ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const sources = {
  camera: require('../../../assets/images/chat/camera.png'),
  gallery: require('../../../assets/images/chat/gallery.png'),
  close: require('../../../assets/images/icons/close.png'),
  chevron: require('../../../assets/images/icons/chevron-right.png'),
  sparkle: require('../../../assets/images/icons/sparkle.png'),
  person: require('../../../assets/images/chat/person.png'),
  sliders: require('../../../assets/images/chat/sliders.png'),
  bell: require('../../../assets/images/chat/bell.png'),
  help: require('../../../assets/images/chat/help.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

export type ProfileIconName = keyof typeof sources;

/** Ícone PNG monocromático pintado com `color` (sem SVG). Decorativo: quem o contém leva o rótulo de acessibilidade. */
export function ProfileIcon({ name, size = 22, color }: { name: ProfileIconName; size?: number; color: string }) {
  return <Image source={sources[name]} style={{ width: size, height: size }} tintColor={color} resizeMode="contain" accessible={false} />;
}
