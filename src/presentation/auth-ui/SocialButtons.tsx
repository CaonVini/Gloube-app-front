import { View } from 'react-native';
import { SocialButton } from './Button';
import { FacebookIcon, GoogleIcon } from './icons';

interface Props {
  onGoogle: () => void;
  onFacebook: () => void;
  disabled?: boolean;
}

export function SocialButtons({ onGoogle, onFacebook, disabled }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <SocialButton title="Continuar com Google" label="Google" icon={<GoogleIcon />} onPress={onGoogle} disabled={disabled} />
      <SocialButton title="Continuar com Facebook" label="Facebook" icon={<FacebookIcon />} onPress={onFacebook} disabled={disabled} />
    </View>
  );
}
