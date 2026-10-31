import { useRouter } from 'expo-router';
import { HomeScreen } from '../../src/presentation/home/HomeScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useDemoSession();
  return (
    <HomeScreen
      firstName={user.firstName}
      fullName={user.fullName}
      onPlanTrip={() => router.push('/planner')}
      onSignOut={signOut}
    />
  );
}
