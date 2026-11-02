import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getInitials } from '../../domain/demo-user';
import { GloubeLogo } from '../auth-ui/GloubeLogo';
import { avatarPhoto } from '../discover/assets';
import { AvatarMenu } from './AvatarMenu';

/** Cabeçalho único do app (logo à esquerda + avatar com foto à direita). Usado em todas as telas logadas. */
export function AppHeader({ fullName, onSignOut }: { fullName: string; onSignOut: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  // Mesma posição em todas as telas: o cabeçalho cuida do recuo da barra de status.
  return (
    <View style={[s.header, { marginTop: Math.max(insets.top, 16) + 4 }]}>
      <GloubeLogo width={150} tone="dark" />
      <AvatarMenu initials={getInitials(fullName)} fullName={fullName} onSignOut={onSignOut} photo={avatarPhoto} onProfile={() => router.push('/perfil' as never)} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, marginBottom: 10 },
});
