import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { errorMessage, useAuth } from '../../src/presentation/auth/AuthProvider';
import { AddressFields } from '../../src/presentation/components/AddressFields';
import { Button, Divider, ErrorText, Field, Muted, Screen, Title } from '../../src/presentation/components/ui';
import { SocialButtons } from '../../src/presentation/social/SocialButtons';
import {
  emptyAddressForm, normalizePhone, toAddress, validateAddress, validateEmail, validateName, validatePassword,
  validatePhone, type AddressForm, type FieldErrors,
} from '../../src/domain/validators';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState<AddressForm>(emptyAddressForm);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [addrErrors, setAddrErrors] = useState<FieldErrors<keyof AddressForm>>({});
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const onAddr = useCallback((f: keyof AddressForm, v: string) => setAddress((a) => ({ ...a, [f]: v })), []);

  const submit = async () => {
    const e = {
      name: validateName(name), email: validateEmail(email), phone: validatePhone(phone), password: validatePassword(password),
    };
    const ae = validateAddress(address);
    setErrors(e);
    setAddrErrors(ae);
    setFormError(undefined);
    if (Object.values(e).some(Boolean) || Object.keys(ae).length) return;
    setLoading(true);
    try {
      await register({
        name: name.trim(), email: email.trim(), password, phone: normalizePhone(phone), address: toAddress(address),
      });
    } catch (err) {
      setFormError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Title>Criar conta</Title>
      <Muted>Preencha seus dados para começar</Muted>
      <Field label="Nome" value={name} error={errors.name} onChangeText={setName} autoComplete="name" maxLength={120} />
      <Field label="E-mail" value={email} error={errors.email} onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" autoComplete="email" autoCorrect={false} maxLength={254} />
      <Field label="Telefone" value={phone} error={errors.phone} onChangeText={setPhone} keyboardType="phone-pad"
        autoComplete="tel" placeholder="(11) 99999-8888" maxLength={30} />
      <Field label="Senha" value={password} error={errors.password} onChangeText={setPassword} secureTextEntry
        autoCapitalize="none" autoComplete="new-password" maxLength={128} />
      <Muted>Endereço</Muted>
      <AddressFields value={address} errors={addrErrors} onChange={onAddr} />
      <ErrorText>{formError}</ErrorText>
      <Button title="Cadastrar" onPress={submit} loading={loading} />
      <Divider label="ou" />
      <SocialButtons />
      <Button title="Já tenho conta" variant="link" onPress={() => router.replace('/login')} />
    </Screen>
  );
}
