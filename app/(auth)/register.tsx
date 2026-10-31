import { useRouter } from 'expo-router';
import { stubAuthActions } from '../../src/presentation/auth-ui/authActions';
import { RegisterScreen } from '../../src/presentation/auth-ui/screens/RegisterScreen';

// UI sem integração: usa stubAuthActions. Para religar a API, injete um adaptador sobre useAuth().
export default function Register() {
  const router = useRouter();
  return <RegisterScreen actions={stubAuthActions} onGoToLogin={() => router.replace('/login')} />;
}
