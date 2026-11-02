import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { statA11y, type AccountRowKey, type PlanInfo, type ProfileStat } from '../../domain/profile';
import { fonts } from '../theme/auth-theme';
import { ProfileIcon, type ProfileIconName } from './ProfileIcon';
import { pc } from './profile-theme';

/** Faixa com os 3 números (viagens, países e lugares). */
export const StatsStrip = memo(function StatsStrip({ stats }: { stats: readonly ProfileStat[] }) {
  return (
    <View style={[s.card, s.statsRow]}>
      {stats.map((st, i) => (
        <View key={st.key} style={[s.stat, i > 0 && s.divider]} accessible accessibilityLabel={statA11y(st)}>
          <Text style={s.statValue}>{st.value}</Text>
          <Text style={s.statLabel} numberOfLines={2}>{st.label}</Text>
        </View>
      ))}
    </View>
  );
});

/** Card "Meu acesso": plano ativo + link para os benefícios. */
export const AccessCard = memo(function AccessCard({ plan, onBenefits }: { plan: PlanInfo; onBenefits: () => void }) {
  return (
    <View style={s.card}>
      <View style={s.planRow}>
        <View style={s.planIcon}><ProfileIcon name="sparkle" size={22} color={pc.dark} /></View>
        <View style={s.planText}>
          <Text style={s.planTitle} numberOfLines={1}>{plan.destinations}</Text>
          <Text style={s.planSub} numberOfLines={1}>{plan.plan} · {plan.billing}</Text>
        </View>
        {plan.active ? <View style={s.chip}><Text style={s.chipText}>Ativo</Text></View> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver benefícios do plano"
        onPress={onBenefits}
        style={({ pressed }) => [s.linkRow, pressed && s.pressed]}
      >
        <Text style={s.link}>Ver benefícios do plano</Text>
        <ProfileIcon name="chevron" size={16} color={pc.dark} />
      </Pressable>
    </View>
  );
});

const ROW_ICONS: Record<AccountRowKey, ProfileIconName> = { personal: 'person', preferences: 'sliders', notifications: 'bell', help: 'help' };

/** Lista "Minha conta". */
export const AccountList = memo(function AccountList({ rows, onPress }: { rows: readonly { key: AccountRowKey; label: string }[]; onPress: (k: AccountRowKey) => void }) {
  return (
    <View style={s.card}>
      {rows.map((r, i) => (
        <Pressable
          key={r.key}
          accessibilityRole="button"
          accessibilityLabel={r.label}
          onPress={() => onPress(r.key)}
          style={({ pressed }) => [s.row, i > 0 && s.rowDivider, pressed && s.pressed]}
        >
          <ProfileIcon name={ROW_ICONS[r.key]} size={22} color={pc.dark} />
          <Text style={s.rowText}>{r.label}</Text>
          <ProfileIcon name="chevron" size={16} color={pc.muted} />
        </Pressable>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  card: { backgroundColor: pc.card, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: pc.border, overflow: 'hidden', flexDirection: 'column' },
  pressed: { opacity: 0.7 },
  // Estatísticas
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 6, gap: 2 },
  divider: { borderLeftWidth: StyleSheet.hairlineWidth, borderColor: pc.border },
  statValue: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, color: pc.dark },
  statLabel: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 15, color: pc.muted, textAlign: 'center' },
  // Plano
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  planIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: pc.badgeBg, alignItems: 'center', justifyContent: 'center' },
  planText: { flex: 1, gap: 1 },
  planTitle: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, color: pc.dark },
  planSub: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 17, color: pc.muted },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: pc.chipBg },
  chipText: { fontFamily: fonts.semibold, fontSize: 13, color: pc.dark },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingHorizontal: 14, borderTopWidth: StyleSheet.hairlineWidth, borderColor: pc.border },
  link: { fontFamily: fonts.medium, fontSize: 14, color: pc.teal },
  // Conta
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 52, paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: pc.border },
  rowText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: pc.body },
});
