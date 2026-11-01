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

const FAB = 46; // diâmetro do destaque central (integrado à barra)
const NOTCH = FAB + 14; // recorte curvo ao redor da bola
const LIFT = 10; // quanto sobe acima dos demais ícones: só um pouco
const NOTCH_TOP = -LIFT + FAB / 2 - NOTCH / 2; // centrado na bola

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
      <View style={s.slot}>
        {/* Recorte curvo: círculo na cor do fundo atrás da bola, "morde" a borda da barra (sem SVG). */}
        <View pointerEvents="none" style={s.notch} />
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
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  slot: { flex: 1, alignItems: 'center' },
  tab: { gap: 3, minHeight: 48, paddingVertical: 2 },
  icon: { width: 24, height: 24 },
  label: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: COLORS.inactive },
  labelActive: { fontFamily: fonts.bold, color: COLORS.active },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.active },
  dotHidden: { opacity: 0 },
  notch: {
    position: 'absolute',
    top: NOTCH_TOP,
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: homeColors.background,
  },
  fab: {
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    marginTop: -LIFT,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: { marginTop: 4, paddingBottom: 2 },
  fabIcon: { width: 24, height: 24 },
  pressed: { opacity: 0.7 },
});
