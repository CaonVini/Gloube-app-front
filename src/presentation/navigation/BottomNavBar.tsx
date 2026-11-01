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

const FAB = 64; // diâmetro do botão central
const RING = 6; // anel na cor do fundo que "recorta" a barra
const LIFT = 26; // quanto o botão sobe acima da barra
/** Espaço que o conteúdo acima da barra deve reservar para a bola central, que se projeta para cima. */
export const NAV_FAB_CLEARANCE = LIFT + RING + 2;
/** Largura (com folga) que a bola central ocupa no meio da barra: os botões de rodapé se dividem ao redor dela. */
export const NAV_FAB_WIDTH = FAB + RING * 2 + 10;

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
  fab: {
    width: FAB + RING * 2,
    height: FAB + RING * 2,
    borderRadius: (FAB + RING * 2) / 2,
    marginTop: -LIFT - RING,
    marginBottom: 0,
    backgroundColor: COLORS.accent,
    borderWidth: RING,
    borderColor: homeColors.background, // anel = cor do fundo da tela
    alignItems: 'center',
    justifyContent: 'center',
    // sombra sutil só no ícone/botão (iOS + Android)
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabLabel: { marginTop: 2, paddingBottom: 2 },
  fabIcon: { width: 28, height: 28 },
  pressed: { opacity: 0.7 },
});
