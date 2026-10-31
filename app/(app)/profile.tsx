import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { errorMessage, useAuth } from '../../src/presentation/auth/AuthProvider';
import { AddressFields } from '../../src/presentation/components/AddressFields';
import { Button, ErrorText, Field, Muted, Screen, Title } from '../../src/presentation/components/ui';
import {
  fromAddress, normalizePhone, toAddress, validateAddress, validateName, validatePhone, type AddressForm, type FieldErrors,
} from '../../src/domain/validators';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState<AddressForm>(() => fromAddress(user?.address ?? null));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [addrErrors, setAddrErrors] = useState<FieldErrors<keyof AddressForm>>({});
  const [formError, setFormError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const onAddr = useCallback((f: keyof AddressForm, v: string) => setAddress((a) => ({ ...a, [f]: v })), []);

  if (!user) return null;

  const startEdit = () => {
    setName(user.name);
    setPhone(user.phone ?? '');
    setAddress(fromAddress(user.address));
    setErrors({});
    setAddrErrors({});
    setFormError(undefined);
    setEditing(true);
  };

  const save = async () => {
    const e = { name: validateName(name), phone: validatePhone(phone) };
    const ae = validateAddress(address);
    setErrors(e);
    setAddrErrors(ae);
    if (Object.values(e).some(Boolean) || Object.keys(ae).length) return;
    setSaving(true);
    setFormError(undefined);
    try {
      await updateProfile({ name: name.trim(), phone: normalizePhone(phone), address: toAddress(address) });
      setEditing(false);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <Screen>
        <Title>Editar perfil</Title>
        <Field label="Nome" value={name} error={errors.name} onChangeText={setName} maxLength={120} />
        <Field label="Telefone" value={phone} error={errors.phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={30} />
        <AddressFields value={address} errors={addrErrors} onChange={onAddr} />
        <ErrorText>{formError}</ErrorText>
        <Button title="Salvar" onPress={save} loading={saving} />
        <Button title="Cancelar" variant="outline" onPress={() => setEditing(false)} disabled={saving} />
      </Screen>
    );
  }

  const a = user.address;
  return (
    <Screen>
      <Title>Meu perfil</Title>
      {!user.profileComplete && <ErrorText>Complete seu telefone e endereço para finalizar o cadastro.</ErrorText>}
      <Row label="Nome" value={user.name} />
      <Row label="E-mail" value={user.email} />
      <Row label="Telefone" value={user.phone ?? '—'} />
      <Row
        label="Endereço"
        value={
          a
            ? `${a.street}, ${a.number}${a.complement ? ` – ${a.complement}` : ''}\n${a.neighborhood ? `${a.neighborhood}, ` : ''}${a.city} – ${a.state}\nCEP ${a.zipCode} · ${a.country}`
            : '—'
        }
      />
      <Button title="Editar perfil" onPress={startEdit} />
      <Button title="Sair" variant="outline" onPress={logout} />
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Muted>{label}</Muted>
      <Text selectable style={{ fontSize: 16 }}>{value}</Text>
    </View>
  );
}
