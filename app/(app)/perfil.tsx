import { useRouter } from 'expo-router';
import { ProfileScreen } from '../../src/presentation/profile/ProfileScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

/** Perfil (fictício, só front). Aberto pelo menu do avatar ("Meu perfil"). */
export default function Perfil() {
  const router = useRouter();
  const { signOut } = useDemoSession();
  return <ProfileScreen onBack={() => router.back()} onSignOut={signOut} />;
}
