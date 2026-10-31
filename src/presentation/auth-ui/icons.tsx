import { Image, type ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports */
const sources = {
  user: require('../../../assets/images/icons/user.png'),
  mail: require('../../../assets/images/icons/mail.png'),
  lock: require('../../../assets/images/icons/lock.png'),
  eye: require('../../../assets/images/icons/eye.png'),
  eyeOff: require('../../../assets/images/icons/eye-off.png'),
  arrow: require('../../../assets/images/icons/arrow-right.png'),
  google: require('../../../assets/images/icons/google.png'),
  facebook: require('../../../assets/images/icons/facebook.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

interface IconProps {
  size?: number;
}

// Ícones PNG (4x, gerados dos SVGs originais). Decorativos: ocultos para leitores de tela
// (o campo/botão que os contém já tem rótulo).
const make = (source: ImageSourcePropType, defaultSize: number) =>
  function Icon({ size = defaultSize }: IconProps) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size }}
        resizeMode="contain"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
    );
  };

export const UserIcon = make(sources.user, 20);
export const MailIcon = make(sources.mail, 20);
export const LockIcon = make(sources.lock, 20);
export const ArrowRightIcon = make(sources.arrow, 26);
export const GoogleIcon = make(sources.google, 24);
export const FacebookIcon = make(sources.facebook, 24);

const eyeOn = make(sources.eye, 24);
const eyeOff = make(sources.eyeOff, 24);
export const EyeIcon = ({ off = false, size }: IconProps & { off?: boolean }) =>
  off ? eyeOff({ size }) : eyeOn({ size });
