import { useRouter } from 'expo-router';
import { PlannerPlaceholderScreen } from '../../src/presentation/home/PlannerPlaceholderScreen';

export default function Planner() {
  const router = useRouter();
  return <PlannerPlaceholderScreen onBack={() => router.back()} />;
}
