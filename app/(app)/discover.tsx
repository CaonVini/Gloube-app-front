import { useLocalSearchParams, useRouter } from 'expo-router';
import { DiscoverFlow } from '../../src/presentation/discover/DiscoverFlow';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

/** Aberto SOMENTE pelo banner "Ainda não sabe para onde ir?" da tela Nova viagem. */
export default function Discover() {
  const router = useRouter();
  const { origin } = useLocalSearchParams<{ origin?: string }>();
  const { user, signOut } = useDemoSession();
  return <DiscoverFlow fullName={user.fullName} onSignOut={signOut} onExit={() => router.back()} originText={origin} />;
}
