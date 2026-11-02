import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/presentation/home/HomeScreen';
import { firstNameOf } from '../../src/domain/profile';
import { useProfile } from '../../src/presentation/session/ProfileContext';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

export default function Home() {
  const router = useRouter();
  const { signOut } = useDemoSession();
  const { name } = useProfile();
  return (
    <HomeScreen
      firstName={firstNameOf(name)}
      fullName={name}
      onPlanTrip={() => router.push('/planner')}
      onSignOut={signOut}
    />
  );
}
