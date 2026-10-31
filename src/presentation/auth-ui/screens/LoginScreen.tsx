import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { validateLogin } from '../../../domain/auth-forms';
import type { FieldErrors } from '../../../domain/validators';
import { authColors, fonts } from '../../theme/auth-theme';
import { AuthLayout } from '../AuthLayout';
import type { AuthActions } from '../authActions';
import { PrimaryButton } from '../Button';
import { InlineLink } from '../Checkbox';
import { Divider } from '../Divider';
import { MailIcon, LockIcon } from '../icons';
import { Input, PasswordInput } from '../Input';
import { SocialButtons } from '../SocialButtons';
import { formStyles as f } from './form-styles';

interface Props {
  actions: AuthActions;
  onGoToRegister: () => void;
}

export function LoginScreen({ actions, onGoToRegister }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password'>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;
    const e = validateLogin({ email, password });
    setErrors(e);
    setFormError(undefined);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await actions.login({ email: email.trim(), password });
    } catch {
      setFormError('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={f.form}>
        <View>
          <Text style={f.title} accessibilityRole="header">Entre na sua conta</Text>
          <Text style={f.subtitle}>Sua próxima viagem começa aqui.</Text>
        </View>

        <Input
          label="E-mail" placeholder="Seu e-mail" icon={<MailIcon />} value={email} error={errors.email}
          onChangeText={(v) => { setEmail(v); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
          textContentType="emailAddress" maxLength={254} returnKeyType="next"
        />
        <View style={s.passwordBlock}>
          <PasswordInput
            label="Senha" placeholder="Sua senha" icon={<LockIcon />} value={password} error={errors.password}
            onChangeText={(v) => { setPassword(v); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
            autoComplete="current-password" textContentType="password" maxLength={128}
            returnKeyType="done" onSubmitEditing={submit}
          />
          <Pressable accessibilityRole="link" onPress={actions.forgotPassword} hitSlop={8} style={s.forgot}>
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </Pressable>
        </View>

        {formError ? <Text accessibilityRole="alert" style={f.formError}>{formError}</Text> : null}
        <PrimaryButton title="Entrar" onPress={submit} loading={loading} />

        <Divider label="ou continue com" />
        <SocialButtons onGoogle={actions.loginWithGoogle} onFacebook={actions.loginWithFacebook} disabled={loading} />

        <Text style={f.footer}>
          Não tem uma conta? <InlineLink onPress={onGoToRegister}>Cadastre-se</InlineLink>
        </Text>
        <Text style={f.legal}>
          <Text onPress={actions.openTerms} accessibilityRole="link">Termos de Uso</Text>
          {'  ·  '}
          <Text onPress={actions.openPrivacy} accessibilityRole="link">Política de Privacidade</Text>
        </Text>
      </View>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  passwordBlock: { gap: 4 },
  forgot: { alignSelf: 'flex-end', minHeight: 32, justifyContent: 'center' },
  forgotText: { fontFamily: fonts.semibold, fontSize: 15, color: authColors.link },
});
