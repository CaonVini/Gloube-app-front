import { Redirect } from 'expo-router';
import { useAuth } from '../src/presentation/auth/AuthProvider';

/** Ponto de entrada ("/"): envia para o perfil ou para o login conforme a sessão. */
export default function Index() {
  const { status } = useAuth();
  return <Redirect href={status === 'authenticated' ? '/profile' : '/login'} />;
}
