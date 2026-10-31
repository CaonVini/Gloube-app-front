import { useRouter } from 'expo-router';
import { stubAuthActions } from '../../src/presentation/auth-ui/authActions';
import { LoginScreen } from '../../src/presentation/auth-ui/screens/LoginScreen';

// UI sem integração: usa stubAuthActions. Para religar a API, injete um adaptador sobre useAuth().
export default function Login() {
  const router = useRouter();
  return <LoginScreen actions={stubAuthActions} onGoToRegister={() => router.replace('/register')} />;
}
