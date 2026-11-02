import { ProfileScreen } from '../../src/presentation/profile/ProfileScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

/** Meu perfil (fictício, só front). Aberto tocando no avatar do cabeçalho. */
export default function Perfil() {
  const { signOut } = useDemoSession();
  return <ProfileScreen onSignOut={signOut} />;
}
