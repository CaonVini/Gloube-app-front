import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../theme/auth-theme';
import { bottomPadding, isActive, tabAccessibility, type NavItem } from './nav-items';

const COLORS = {
  bar: '#FFFFFF',
  border: '#ECE9E3',
  active: '#1F3D36', // verde escuro Gloube
  inactive: '#8B9692', // cinza-esverdeado discreto
} as const;

const ICON_AREA = 30; // altura fixa da faixa dos ícones: os rótulos de todas as abas ficam alinhados

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
  return (
    <Pressable {...a11y} onPress={() => onChange(item.key)} style={({ pressed }) => [s.slot, s.tab, pressed && s.pressed]}>
      {/* Indicador discreto: fio curto no topo da barra sobre a aba ativa. */}
      {active ? <View style={s.indicator} /> : null}
      <View style={s.iconArea}><Image source={active && item.activeIcon ? item.activeIcon : item.icon} style={s.icon} resizeMode="contain" tintColor={active ? COLORS.active : COLORS.inactive} /></View>
      <Text style={[s.label, active && s.labelActive]} numberOfLines={1}>{item.label}</Text>
    </Pressable>
  );
});

/** Barra de navegação inferior controlada (sem estado interno): o pai define `activeKey` e reage a `onChange`. */
export function BottomNavBar({ items, activeKey, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityRole="tablist" style={[s.bar, { paddingBottom: bottomPadding(insets.bottom) }]}>
      {items.map((item) => (
        <Tab key={item.key} item={item} active={isActive(item, activeKey)} onChange={onChange} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bar,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    shadowColor: '#1F3D36',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  slot: { flex: 1, alignItems: 'center', paddingTop: 12 },
  tab: { gap: 4, minHeight: 62, paddingBottom: 4 },
  iconArea: { height: ICON_AREA, alignItems: 'center', justifyContent: 'center' },
  indicator: { position: 'absolute', top: -StyleSheet.hairlineWidth, width: 18, height: 2, borderRadius: 1, backgroundColor: COLORS.active },
  icon: { width: 22, height: 22 },
  label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, letterSpacing: 0.3, color: COLORS.inactive },
  labelActive: { fontFamily: fonts.semibold, color: COLORS.active },
  pressed: { opacity: 0.7 },
});
