import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GloubeLogo } from '../auth-ui/GloubeLogo';
import { avatarPhoto } from '../discover/assets';
import { useProfile } from '../session/ProfileContext';
import { AvatarButton } from './AvatarButton';

/** Props antigas, mantidas para não quebrar as telas que ainda as passam: nome e foto agora vêm do perfil. */
interface Legacy {
  /** @deprecated o nome vem de useProfile(). */
  fullName?: string;
  /** @deprecated "Sair" agora fica na tela Meu perfil. */
  onSignOut?: () => void;
}

/** Cabeçalho único do app (logo à esquerda + avatar à direita; tocar no avatar abre Meu perfil). */
export function AppHeader(_legacy: Legacy = {}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name, photoUri } = useProfile();
  const photo = useMemo(() => (photoUri ? { uri: photoUri } : avatarPhoto), [photoUri]);
  const openProfile = useCallback(() => router.push('/perfil' as never), [router]);
  // Mesma posição em todas as telas: o cabeçalho cuida do recuo da barra de status.
  return (
    <View style={[s.header, { marginTop: Math.max(insets.top, 16) + 4 }]}>
      <GloubeLogo width={150} tone="dark" />
      <AvatarButton fullName={name} photo={photo} onPress={openProfile} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, marginBottom: 10 },
});
