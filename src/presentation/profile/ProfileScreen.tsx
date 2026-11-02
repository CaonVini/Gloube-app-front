import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCOUNT_ITEMS, COMING_SOON, DEMO_PROFILE, type AccountItem } from '../../domain/profile';
import { ChatIcon } from '../chat/ChatIcon';
import { MAX_COLUMN, cc, softShadow } from '../chat/chat-theme';
import { avatarPhoto } from '../discover/assets';
import { BottomNavBar, DEFAULT_NAV_ITEMS, useNavRouting } from '../navigation';
import { fonts } from '../theme/auth-theme';

interface Props {
  onBack: () => void;
  onSignOut: () => void;
}

const Row = memo(function Row({ item, last, onPress }: { item: AccountItem; last: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={item.label} onPress={onPress} style={({ pressed }) => [s.row, !last && s.rowLine, pressed && { opacity: 0.6 }]}>
      <View style={s.rowIcon}><ChatIcon name={item.icon} size={22} color={cc.dark} /></View>
      <Text style={s.rowText}>{item.label}</Text>
      <ChatIcon name="chevron" size={16} color={cc.dark} />
    </Pressable>
  );
});

/** Perfil (fictício, sem API): foto, estatísticas, acesso do plano e atalhos da conta. */
export function ProfileScreen({ onBack, onSignOut }: Props) {
  const insets = useSafeAreaInsets();
  const onNav = useNavRouting('profile');
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Ações ainda sem tela: avisa em vez de falhar em silêncio.
  const soon = useCallback(() => {
    setNotice(COMING_SOON);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNotice(null), 2500);
  }, []);
  const p = DEMO_PROFILE;

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: Math.max(insets.top, 16) + 8 }]} showsVerticalScrollIndicator={false}>
        <View style={s.column}>
          <View style={s.titleRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} hitSlop={10} style={s.back}>
              <View style={s.flip}><ChatIcon name="chevron" size={18} color={cc.dark} /></View>
            </Pressable>
            <Text style={s.title} accessibilityRole="header">Meu perfil</Text>
          </View>

          <View style={s.hero}>
            <View>
              <Image source={avatarPhoto} style={s.photo} accessibilityLabel={`Foto de ${p.name}`} />
              <Pressable accessibilityRole="button" accessibilityLabel="Trocar foto" onPress={soon} style={s.cam}>
                <ChatIcon name="camera" size={16} color={cc.dark} />
              </Pressable>
            </View>
            <Text style={s.name}>{p.name}</Text>
            <Text style={s.email}>{p.email}</Text>
            <Pressable accessibilityRole="link" onPress={soon} hitSlop={8}><Text style={s.edit}>Editar perfil</Text></Pressable>
          </View>

          <View style={[s.card, s.stats]}>
            {p.stats.map((st, i) => (
              <View key={st.key} style={[s.stat, i > 0 && s.statLine]} accessible accessibilityLabel={`${st.value} ${st.label}`}>
                <Text style={s.statValue}>{st.value}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          <Text style={s.section}>Meu acesso</Text>
          <View style={s.card}>
            <View style={s.plan}>
              <View style={s.planIcon}><Image source={require('../../../assets/images/icons/sparkle.png')} style={s.sparkle} tintColor={cc.dark} accessible={false} /></View>
              <View style={s.planText}>
                <Text style={s.planTitle}>{p.plan.title}</Text>
                <Text style={s.planSub}>{p.plan.subtitle}</Text>
              </View>
              {p.plan.active ? <View style={s.badge}><Text style={s.badgeText}>Ativo</Text></View> : null}
            </View>
            <Pressable accessibilityRole="button" onPress={soon} style={({ pressed }) => [s.benefits, pressed && { opacity: 0.6 }]}>
              <Text style={s.benefitsText}>Ver benefícios do plano</Text>
              <ChatIcon name="chevron" size={16} color={cc.teal} />
            </Pressable>
          </View>

          <Text style={s.section}>Minha conta</Text>
          <View style={s.card}>
            {ACCOUNT_ITEMS.map((it, i) => <Row key={it.key} item={it} last={i === ACCOUNT_ITEMS.length - 1} onPress={soon} />)}
          </View>

          <Pressable accessibilityRole="button" accessibilityLabel="Sair da conta" onPress={onSignOut} style={({ pressed }) => [s.signOut, pressed && { opacity: 0.6 }]}>
            <Text style={s.signOutText}>Sair da conta</Text>
          </Pressable>
        </View>
      </ScrollView>

      {notice ? <View style={s.toast} accessibilityRole="alert" accessibilityLiveRegion="polite"><Text style={s.toastText}>{notice}</Text></View> : null}
      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="profile" onChange={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: cc.bg },
  content: { paddingBottom: 24 },
  column: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center', paddingHorizontal: 18, gap: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...softShadow },
  flip: { transform: [{ scaleX: -1 }] },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: cc.dark },
  hero: { alignItems: 'center', gap: 2, marginTop: 4, marginBottom: 6 },
  photo: { width: 104, height: 104, borderRadius: 52, backgroundColor: cc.mint },
  cam: { position: 'absolute', right: 0, bottom: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: cc.mint, borderWidth: 2, borderColor: cc.bg, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: fonts.bold, fontSize: 21, lineHeight: 28, color: cc.dark, marginTop: 8 },
  email: { fontFamily: fonts.regular, fontSize: 14, color: '#6F7773' },
  edit: { fontFamily: fonts.semibold, fontSize: 14, color: cc.teal, textDecorationLine: 'underline', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: cc.border, ...softShadow },
  stats: { flexDirection: 'row', paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 4 },
  statLine: { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: '#D6D9D7' },
  statValue: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, color: cc.dark },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, color: '#6F7773', textAlign: 'center' },
  section: { fontFamily: fonts.bold, fontSize: 16, color: cc.dark, marginTop: 10 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  planIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: cc.mint, alignItems: 'center', justifyContent: 'center' },
  sparkle: { width: 22, height: 22 },
  planText: { flex: 1 },
  planTitle: { fontFamily: fonts.semibold, fontSize: 16, color: cc.dark },
  planSub: { fontFamily: fonts.regular, fontSize: 12, color: '#6F7773' },
  badge: { backgroundColor: cc.mint, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12, color: cc.dark },
  benefits: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderColor: cc.border },
  benefitsText: { fontFamily: fonts.semibold, fontSize: 14, color: cc.teal },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, minHeight: 52 },
  rowLine: { borderBottomWidth: StyleSheet.hairlineWidth, borderColor: cc.border },
  rowIcon: { width: 26, alignItems: 'center' },
  rowText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: cc.dark },
  signOut: { alignItems: 'center', paddingVertical: 14, marginTop: 6 },
  signOutText: { fontFamily: fonts.semibold, fontSize: 15, color: cc.danger },
  toast: { position: 'absolute', alignSelf: 'center', bottom: 110, backgroundColor: cc.dark, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10 },
  toastText: { fontFamily: fonts.medium, fontSize: 13, color: '#FFFFFF' },
});
