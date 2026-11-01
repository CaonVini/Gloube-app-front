import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, homeColors } from '../theme/auth-theme';
import { bottomPadding, isActive, tabAccessibility, type NavItem } from './nav-items';

const COLORS = {
  bar: '#FFFFFF',
  border: '#E7E4DD',
  active: '#1F3D36',
  inactive: '#4B5654',
  accent: '#F1EF71', // amarelo-limão da ilustração da Home
  accentIcon: '#1F3D36',
} as const;

const FAB = 44; // diâmetro do destaque central
const GAP = 6; // folga uniforme entre a bola e o recorte
const NOTCH = FAB + GAP * 2; // diâmetro do recorte curvo
const BAR_PAD = 10; // padding superior da barra
const CENTER_Y = 8; // centro da bola, medido a partir do topo da barra (só um pouco acima dos ícones)
const BALL_TOP = CENTER_Y - FAB / 2 - BAR_PAD; // topo da bola relativo ao slot

interface Props {
  items: readonly NavItem[];
  activeKey: string;
  onChange: (key: string) => void;
}

interface TabProps {
  item: NavItem;
  active: boolean;
  onChange: (key: string) => void;
}

const Tab = memo(function Tab({ item, active, onChange }: TabProps) {
  const a11y = tabAccessibility(item, active);
  if (item.highlight) {
    return (
      <View style={[s.slot, s.fabSlot]}>
        {/* Recorte curvo: círculo (cor do fundo, mesma borda da barra) concêntrico à bola; só a parte abaixo do topo da barra aparece. */}
        <View pointerEvents="none" style={s.notchClip}>
          <View style={s.notch} />
        </View>
        <Pressable
          {...a11y}
          onPress={() => onChange(item.key)}
          style={({ pressed }) => [s.fab, pressed && s.pressed]}
          hitSlop={6}
        >
          <Image source={item.icon} style={s.fabIcon} resizeMode="contain" tintColor={COLORS.accentIcon} />
        </Pressable>
        <Text style={[s.label, s.fabLabel, active && s.labelActive]} numberOfLines={1}>{item.label}</Text>
      </View>
    );
  }
  return (
    <Pressable {...a11y} onPress={() => onChange(item.key)} style={({ pressed }) => [s.slot, s.tab, pressed && s.pressed]}>
      <Image source={active && item.activeIcon ? item.activeIcon : item.icon} style={s.icon} resizeMode="contain" tintColor={active ? COLORS.active : COLORS.inactive} />
      <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>{item.label}</Text>
      <View style={[s.dot, !active && s.dotHidden]} />
    </Pressable>
  );
});

/** Barra de navegação inferior controlada (sem estado interno): o pai define `activeKey` e reage a `onChange`. */
export function BottomNavBar({ items, activeKey, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      accessibilityRole="tablist"
      style={[s.bar, { paddingBottom: bottomPadding(insets.bottom) }]}
    >
      {items.map((item) => (
        <Tab key={item.key} item={item} active={isActive(item, activeKey)} onChange={onChange} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.bar,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    paddingTop: BAR_PAD,
    paddingHorizontal: 8,
  },
  slot: { flex: 1, alignItems: 'center' },
  fabSlot: { alignSelf: 'stretch' }, // topo alinhado ao topo da barra: o recorte usa essa referência
  tab: { gap: 3, minHeight: 48, paddingVertical: 2 },
  icon: { width: 24, height: 24 },
  label: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: COLORS.inactive },
  labelActive: { fontFamily: fonts.bold, color: COLORS.active },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.active },
  dotHidden: { opacity: 0 },
  notchClip: {
    position: 'absolute',
    top: -BAR_PAD,
    left: 0,
    right: 0,
    height: CENTER_Y + NOTCH / 2 + 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  notch: {
    marginTop: CENTER_Y - NOTCH / 2,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: homeColors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    marginTop: BALL_TOP,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: { marginTop: 9 },
  fabIcon: { width: 24, height: 24 },
  pressed: { opacity: 0.7 },
});
