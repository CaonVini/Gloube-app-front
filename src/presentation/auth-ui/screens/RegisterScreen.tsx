import { useState } from 'react';
import { Text, View } from 'react-native';
import { validateRegister } from '../../../domain/auth-forms';
import type { FieldErrors } from '../../../domain/validators';
import { AuthLayout } from '../AuthLayout';
import type { AuthActions } from '../authActions';
import { PrimaryButton } from '../Button';
import { Checkbox, InlineLink } from '../Checkbox';
import { LockIcon, MailIcon, UserIcon } from '../icons';
import { Input, PasswordInput } from '../Input';
import { formStyles as f } from './form-styles';

type Field = 'name' | 'email' | 'password' | 'acceptedTerms';

interface Props {
  actions: AuthActions;
  onGoToLogin: () => void;
}

export function RegisterScreen({ actions, onGoToLogin }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAccepted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const clear = (k: Field) => setErrors((p) => (p[k] ? { ...p, [k]: undefined } : p));

  const submit = async () => {
    if (loading) return;
    const e = validateRegister({ name, email, password, acceptedTerms });
    setErrors(e);
    setFormError(undefined);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      await actions.register({ name: name.trim(), email: email.trim(), password });
    } catch {
      setFormError('Não foi possível criar a conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <View style={f.form}>
        <View>
          <Text style={f.title} accessibilityRole="header">Crie sua conta</Text>
          <Text style={f.subtitle}>Sua próxima viagem começa aqui.</Text>
        </View>

        <Input
          label="Nome" placeholder="Seu nome" icon={<UserIcon />} value={name} error={errors.name}
          onChangeText={(v) => { setName(v); clear('name'); }}
          autoComplete="name" textContentType="name" autoCapitalize="words" maxLength={120} returnKeyType="next"
        />
        <Input
          label="E-mail" placeholder="Seu e-mail" icon={<MailIcon />} value={email} error={errors.email}
          onChangeText={(v) => { setEmail(v); clear('email'); }}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
          textContentType="emailAddress" maxLength={254} returnKeyType="next"
        />
        <PasswordInput
          label="Senha" placeholder="Crie uma senha" icon={<LockIcon />} value={password} error={errors.password}
          hint="Use pelo menos 8 caracteres." onChangeText={(v) => { setPassword(v); clear('password'); }}
          autoComplete="new-password" textContentType="newPassword" maxLength={128} returnKeyType="done"
        />

        <Checkbox
          checked={acceptedTerms}
          onChange={(v) => { setAccepted(v); clear('acceptedTerms'); }}
          error={errors.acceptedTerms}
          accessibilityLabel="Li e aceito os Termos de Uso e a Política de Privacidade"
        >
          Li e aceito os <InlineLink onPress={actions.openTerms}>Termos de Uso</InlineLink> e a{' '}
          <InlineLink onPress={actions.openPrivacy}>Política de Privacidade</InlineLink>
        </Checkbox>

        {formError ? <Text accessibilityRole="alert" style={f.formError}>{formError}</Text> : null}
        <PrimaryButton title="Criar conta" onPress={submit} loading={loading} />

        <Text style={f.footer}>
          Já tem uma conta? <InlineLink onPress={onGoToLogin}>Entrar</InlineLink>
        </Text>
      </View>
    </AuthLayout>
  );
}
