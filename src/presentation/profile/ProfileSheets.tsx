import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_NAME, PLAN_BENEFITS, validateName } from '../../domain/profile';
import { PrimaryButton } from '../auth-ui/Button';
import { Input } from '../auth-ui/Input';
import { UserIcon, MailIcon } from '../auth-ui/icons';
import { fonts } from '../theme/auth-theme';
import { BottomSheet } from './BottomSheet';
import { pc } from './profile-theme';

/** Benefícios do plano ativo (texto fictício). */
export function BenefitsSheet({ visible, plan, onClose }: { visible: boolean; plan: string; onClose: () => void }) {
  return (
    <BottomSheet visible={visible} title={`Benefícios do ${plan}`} onClose={onClose}>
      <View style={s.list}>
        {PLAN_BENEFITS.map((b) => (
          <View key={b} style={s.benefit}>
            <View style={s.dot} />
            <Text style={s.benefitText}>{b}</Text>
          </View>
        ))}
      </View>
      <PrimaryButton title="Entendi" onPress={onClose} />
    </BottomSheet>
  );
}

interface EditProps { visible: boolean; name: string; email: string; onSave: (name: string) => void; onClose: () => void }

/** Edição dos dados pessoais: o nome é validado/sanitizado; o e-mail é só leitura (fictício). */
export function EditProfileSheet({ visible, name, email, onSave, onClose }: EditProps) {
  // O pai monta a folha só quando aberta (key), então o rascunho sempre começa no nome atual.
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string>();
  const submit = () => {
    const r = validateName(draft);
    if (!r.ok) { setError(r.reason); return; }
    onSave(r.value);
  };
  return (
    <BottomSheet visible={visible} title="Dados pessoais" onClose={onClose}>
      <Input
        label="Nome"
        icon={<UserIcon />}
        value={draft}
        onChangeText={(t) => { setDraft(t); if (error) setError(undefined); }}
        error={error}
        maxLength={MAX_NAME + 20}
        autoCapitalize="words"
        autoCorrect={false}
        textContentType="name"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <Input label="E-mail" icon={<MailIcon />} value={email} editable={false} hint="O e-mail não pode ser alterado aqui." />
      <PrimaryButton title="Salvar" onPress={submit} />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  list: { gap: 12 },
  benefit: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: pc.teal, marginTop: 7 },
  benefitText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: pc.body },
});
