import { Image, type ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const sources = {
  send: require('../../../assets/images/chat/send.png'),
  mic: require('../../../assets/images/chat/mic.png'),
  camera: require('../../../assets/images/chat/camera.png'),
  gallery: require('../../../assets/images/chat/gallery.png'),
  play: require('../../../assets/images/chat/play.png'),
  pause: require('../../../assets/images/chat/pause.png'),
  stop: require('../../../assets/images/chat/stop.png'),
  plus: require('../../../assets/images/icons/plus.png'),
  close: require('../../../assets/images/icons/close.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

export type ChatIconName = keyof typeof sources;

/** Ícone PNG monocromático pintado com `color` (sem SVG). Decorativo: o botão que o contém leva o rótulo de acessibilidade. */
export function ChatIcon({ name, size = 22, color }: { name: ChatIconName; size?: number; color: string }) {
  return <Image source={sources[name]} style={{ width: size, height: size }} tintColor={color} resizeMode="contain" accessible={false} />;
}

export const auroraAvatar: ImageSourcePropType = require('../../../assets/images/aurora-avatar.png');
