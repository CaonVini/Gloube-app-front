import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { createDemoAuthActions } from '../../src/presentation/auth-ui/authActions';
import { RegisterScreen } from '../../src/presentation/auth-ui/screens/RegisterScreen';
import { useDemoSession } from '../../src/presentation/session/DemoSession';

// Fluxo fictício: entrar abre a sessão de demonstração (sem API). Para religar a API, injete um adaptador sobre useAuth().
export default function Register() {
  const router = useRouter();
  const { signIn } = useDemoSession();
  const actions = useMemo(() => createDemoAuthActions(signIn), [signIn]);
  return <RegisterScreen actions={actions} onGoToLogin={() => router.replace('/login')} />;
}
