import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCOUNT_ROWS, DEMO_PLAN, DEMO_STATS, type AccountRowKey } from '../../domain/profile';
import { avatarPhoto } from '../discover/assets';
import { BottomNavBar, DEFAULT_NAV_ITEMS, useNavRouting } from '../navigation';
import { useProfile } from '../session/ProfileContext';
import { fonts } from '../theme/auth-theme';
import { AvatarPicker } from './AvatarPicker';
import { AccessCard, AccountList, StatsStrip } from './ProfileSections';
import { BenefitsSheet, EditProfileSheet } from './ProfileSheets';
import { H_PADDING, MAX_COLUMN, pc } from './profile-theme';
import { useAvatarPicker } from './useAvatarPicker';

const NOTICE_MS = 3500;
const SOON: Partial<Record<AccountRowKey, string>> = {
  preferences: 'Preferências de viagem chegam em breve.',
  notifications: 'Notificações chegam em breve.',
  help: 'Ajuda e suporte chegam em breve.',
};

/**
 * Tela "Meu perfil" (acessada tocando no avatar do cabeçalho). 100% local e fictícia: nome e foto ficam só em memória
 * (ProfileContext), nada vai a servidor e nenhuma credencial é exibida.
 */
export function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const onNav = useNavRouting('profile');
  const { name, email, photoUri, setName, setPhotoUri } = useProfile();

  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [benefits, setBenefits] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const pick = useAvatarPicker(setPhotoUri, showNotice);
  const removePhoto = useCallback(() => setPhotoUri(null), [setPhotoUri]);
  const photo = useMemo(() => (photoUri ? { uri: photoUri } : avatarPhoto), [photoUri]);

  const onRow = useCallback((k: AccountRowKey) => {
    if (k === 'personal') setEditing(true);
    else showNotice(SOON[k] ?? 'Em breve.');
  }, [showNotice]);
  const closeEdit = useCallback(() => setEditing(false), []);
  const saveName = useCallback((n: string) => { setName(n); setEditing(false); }, [setName]);
  const closeBenefits = useCallback(() => setBenefits(false), []);
  const openBenefits = useCallback(() => setBenefits(true), []);

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.content, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.column}>
          <View style={s.titleRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.back()} hitSlop={10} style={({ pressed }) => pressed && s.pressed}>
              <Text style={s.back}>‹</Text>
            </Pressable>
            <Text style={s.title} accessibilityRole="header">Meu perfil</Text>
          </View>

          <View style={s.identity}>
            <AvatarPicker photo={photo} hasCustomPhoto={photoUri !== null} onPick={pick} onRemove={removePhoto} />
            <Text style={s.name} numberOfLines={2}>{name}</Text>
            <Text style={s.email} numberOfLines={1}>{email}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Editar perfil" onPress={() => setEditing(true)} hitSlop={8} style={({ pressed }) => pressed && s.pressed}>
              <Text style={s.edit}>Editar perfil</Text>
            </Pressable>
          </View>

          <StatsStrip stats={DEMO_STATS} />

          <Text style={s.section} accessibilityRole="header">Meu acesso</Text>
          <AccessCard plan={DEMO_PLAN} onBenefits={openBenefits} />

          <Text style={s.section} accessibilityRole="header">Minha conta</Text>
          <AccountList rows={ACCOUNT_ROWS} onPress={onRow} />

          <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={onSignOut} style={({ pressed }) => [s.signOut, pressed && s.pressed]}>
            <Text style={s.signOutText}>Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      {notice ? (
        <View style={s.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <Text style={s.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="profile" onChange={onNav} />

      {/* Montada só quando aberta: o rascunho do nome sempre parte do valor atual. */}
      {editing ? <EditProfileSheet visible name={name} email={email} onSave={saveName} onClose={closeEdit} /> : null}
      <BenefitsSheet visible={benefits} plan={DEMO_PLAN.plan} onClose={closeBenefits} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: pc.bg },
  content: { paddingHorizontal: H_PADDING, paddingBottom: 28 },
  column: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center', gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  back: { fontFamily: fonts.medium, fontSize: 34, lineHeight: 36, color: pc.dark, marginTop: -4 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, color: pc.dark },
  identity: { alignItems: 'center', gap: 4, marginBottom: 6 },
  name: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, color: pc.dark, textAlign: 'center', marginTop: 10 },
  email: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, color: pc.muted },
  edit: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18, color: pc.teal, textDecorationLine: 'underline', marginTop: 2 },
  section: { fontFamily: fonts.bold, fontSize: 17, lineHeight: 22, color: pc.dark, marginTop: 10 },
  signOut: { alignItems: 'center', justifyContent: 'center', minHeight: 48, marginTop: 6 },
  signOutText: { fontFamily: fonts.semibold, fontSize: 15, color: pc.danger },
  pressed: { opacity: 0.7 },
  notice: { position: 'absolute', left: 16, right: 16, bottom: 96, maxWidth: MAX_COLUMN, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: pc.dark },
  noticeText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: '#FFFFFF', textAlign: 'center' },
});
