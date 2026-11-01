import { useRouter } from 'expo-router';
import { DiscoverFlow } from '../../src/presentation/discover/DiscoverFlow';

export default function Discover() {
  const router = useRouter();
  return <DiscoverFlow onExit={() => router.back()} />;
}
