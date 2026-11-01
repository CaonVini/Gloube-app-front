import { Image, type ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const sources = {
  flake: require('../../../assets/images/discover/icons/flake.png'),
  sun: require('../../../assets/images/discover/icons/sun.png'),
  contrast: require('../../../assets/images/discover/icons/contrast.png'),
  home: require('../../../assets/images/discover/icons/home.png'),
  pin: require('../../../assets/images/discover/icons/pin.png'),
  world: require('../../../assets/images/discover/icons/world.png'),
  heart: require('../../../assets/images/discover/icons/heart.png'),
  heartOutline: require('../../../assets/images/discover/icons/heart-outline.png'),
  couple: require('../../../assets/images/discover/icons/couple.png'),
  friends: require('../../../assets/images/discover/icons/friends.png'),
  family: require('../../../assets/images/discover/icons/family.png'),
  solo: require('../../../assets/images/discover/icons/solo.png'),
  child: require('../../../assets/images/discover/icons/child.png'),
  elder: require('../../../assets/images/discover/icons/elder.png'),
  access: require('../../../assets/images/discover/icons/access.png'),
  paw: require('../../../assets/images/discover/icons/paw.png'),
  calendar: require('../../../assets/images/discover/icons/calendar.png'),
  calendarMonth: require('../../../assets/images/discover/icons/calendar-month.png'),
  help: require('../../../assets/images/discover/icons/help.png'),
  coin1: require('../../../assets/images/discover/icons/coin1.png'),
  coin2: require('../../../assets/images/discover/icons/coin2.png'),
  coin3: require('../../../assets/images/discover/icons/coin3.png'),
  coin4: require('../../../assets/images/discover/icons/coin4.png'),
  infinity: require('../../../assets/images/discover/icons/infinity.png'),
  check: require('../../../assets/images/discover/icons/check.png'),
  chevronLeft: require('../../../assets/images/discover/icons/chevron-left.png'),
  chevronRight: require('../../../assets/images/icons/chevron-right.png'),
  sparkle: require('../../../assets/images/icons/sparkle.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

export type DiscoverIconName = keyof typeof sources;

/** Glifo PNG leve (96px) tingido via `tintColor`; decorativo: o controle que o contém leva o rótulo. */
export function DIcon({ name, size = 24, color }: { name: DiscoverIconName; size?: number; color: string }) {
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
