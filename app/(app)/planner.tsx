import { NewTripScreen } from '../../src/presentation/trip/NewTripScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

/** Tela aberta por "Planejar minha viagem": passo 1 de 3 de Nova viagem (fluxo fictício, só front). */
export default function Planner() {
  const { user, signOut } = useDemoSession();
  return <NewTripScreen fullName={user.fullName} onSignOut={signOut} />;
}
