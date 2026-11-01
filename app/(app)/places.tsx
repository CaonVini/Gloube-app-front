import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { DESTINATION_CATALOG } from '../../src/domain/trip-plan';
import { useDemoSession } from '../../src/presentation/session/DemoSession';
import { DirectTripFlow } from '../../src/presentation/trip/DirectTripFlow';

/** Aberto por "Próximo" na tela Nova viagem quando o destino já está definido (pula o Descubra). */
export default function Places() {
  const router = useRouter();
  const { dests } = useLocalSearchParams<{ dests?: string }>();
  const { user, signOut } = useDemoSession();
  const destinations = useMemo(() => {
    const ids = (dests ?? '').split(',').filter(Boolean);
    return ids.flatMap((id) => DESTINATION_CATALOG.filter((d) => d.id === id));
  }, [dests]);
  return <DirectTripFlow fullName={user.fullName} onSignOut={signOut} onExit={() => router.back()} destinations={destinations} />;
}
