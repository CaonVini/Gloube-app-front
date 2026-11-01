import { useRouter } from 'expo-router';
import { useDemoSession } from '../../src/presentation/session/DemoSession';
import { NewTripScreen } from '../../src/presentation/trip/NewTripScreen';

/** Tela aberta por "Planejar minha viagem": passo 1 de 3 de Nova viagem (fluxo fictício, só front). */
export default function Planner() {
  const router = useRouter();
  const { user, signOut } = useDemoSession();
  return <NewTripScreen fullName={user.fullName} onSignOut={signOut} onDiscover={(origin) => router.push({ pathname: '/discover', params: { origin } })} />;
}
