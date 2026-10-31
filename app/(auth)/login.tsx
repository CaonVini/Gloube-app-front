import { useRouter } from 'expo-router';
import { useState } from 'react';
import { errorMessage, useAuth } from '../../src/presentation/auth/AuthProvider';
import { Button, Divider, ErrorText, Field, Muted, Screen, Title } from '../../src/presentation/components/ui';
import { SocialButtons } from '../../src/presentation/social/SocialButtons';
import { validateEmail } from '../../src/domain/validators';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const e = { email: validateEmail(email), password: password ? undefined : 'Informe a senha' };
    setErrors(e);
    setFormError(undefined);
    if (e.email || e.password) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setFormError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>Entrar</Title>
      <Muted>Acesse sua conta Aurora</Muted>
      <Field label="E-mail" value={email} error={errors.email} onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" autoComplete="email" autoCorrect={false} maxLength={254} />
      <Field label="Senha" value={password} error={errors.password} onChangeText={setPassword} secureTextEntry
        autoCapitalize="none" autoComplete="current-password" maxLength={128} onSubmitEditing={submit} />
      <ErrorText>{formError}</ErrorText>
      <Button title="Entrar" onPress={submit} loading={loading} />
      <Divider label="ou" />
      <SocialButtons />
      <Button title="Criar conta" variant="link" onPress={() => router.replace('/register')} />
    </Screen>
  );
}
