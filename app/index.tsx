import { Redirect } from 'expo-router';
import { useDemoSession } from '../src/presentation/session/DemoSession';

/** Ponto de entrada ("/"): envia para a Home ou para o login conforme a sessão fictícia. */
export default function Index() {
  const { signedIn } = useDemoSession();
  return <Redirect href={signedIn ? '/home' : '/login'} />;
}
