import { Image, type ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const sources = {
  crosshair: require('../../../assets/images/icons/crosshair.png'),
  pin: require('../../../assets/images/icons/pin.png'),
  search: require('../../../assets/images/icons/search.png'),
  grip: require('../../../assets/images/icons/grip.png'),
  plus: require('../../../assets/images/icons/plus.png'),
  chevronRight: require('../../../assets/images/icons/chevron-right.png'),
  close: require('../../../assets/images/icons/close.png'),
  compass: require('../../../assets/images/icons/nav-discover.png'),
  arrow: require('../../../assets/images/icons/arrow-right.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

export type TripIconName = keyof typeof sources;

/** Ícone PNG monocromático tingido via `tintColor` (decorativo: o controle que o contém leva o rótulo). */
export function TripIcon({ name, size = 20, color }: { name: TripIconName; size?: number; color: string }) {
  return (
    <Image
      source={sources[name]}
      style={{ width: size, height: size }}
      resizeMode="contain"
      tintColor={color}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
