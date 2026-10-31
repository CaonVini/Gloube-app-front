import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { createDemoAuthActions } from '../../src/presentation/auth-ui/authActions';
import { LoginScreen } from '../../src/presentation/auth-ui/screens/LoginScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

// Fluxo fictício: entrar abre a sessão de demonstração (sem API). Para religar a API, injete um adaptador sobre useAuth().
export default function Login() {
  const router = useRouter();
  const { signIn } = useDemoSession();
  const actions = useMemo(() => createDemoAuthActions(signIn), [signIn]);
  return <LoginScreen actions={actions} onGoToRegister={() => router.replace('/register')} />;
}
