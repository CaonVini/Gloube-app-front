import { memo, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Experience } from '../../domain/discover/types';
import { getInitials } from '../../domain/demo-user';
import { GloubeLogo } from '../auth-ui/GloubeLogo';
import { AvatarMenu } from '../home/AvatarMenu';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { experienceImages } from './assets';
import { DIcon, type DiscoverIconName } from './icons';

/** Paleta do fluxo (mesma do app: verde escuro, teal, creme e o amarelo-limão da navbar). */
export const dc = {
  dark: authColors.primary,
  teal: authColors.link,
  lime: '#F1EF71',
  mint: '#E4EDE6',
  mintStrong: '#D3E1D7',
  border: '#ECE9E3',
  card: '#FFFFFF',
  muted: homeColors.subtitle,
} as const;

export const cardShadow = {
  shadowColor: '#1F3D36',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

/** Cabeçalho do app: logo Gloube + avatar (mesmo da Home / Nova viagem). */
export function DiscoverHeader({ fullName, onSignOut }: { fullName: string; onSignOut: () => void }) {
  return (
    <View style={s.header}>
      <GloubeLogo width={150} tone="dark" />
      <AvatarMenu initials={getInitials(fullName)} fullName={fullName} onSignOut={onSignOut} />
    </View>
  );
}

/** Rótulo em caixa alta + barra em segmentos + "n de N". */
export function SegmentedProgress({ kicker, current, total }: { kicker: string; current: number; total: number }) {
  return (
    <View style={s.progressRow} accessible accessibilityRole="progressbar" accessibilityLabel={`${kicker}, etapa ${current} de ${total}`} accessibilityValue={{ min: 0, max: total, now: current }}>
      <Text style={s.kicker}>{kicker}</Text>
      <View style={s.bars}>
        {Array.from({ length: total }, (_, i) => <View key={i} style={[s.bar, i < current && s.barOn]} />)}
      </View>
      <Text style={s.kicker}>{current} de {total}</Text>
    </View>
  );
}

export function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={s.titleBox}>
      <Text style={s.title} accessibilityRole="header">{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function CheckBadge({ on }: { on: boolean }) {
  return (
    <View style={[s.check, on && s.checkOn]}>{on ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
  );
}

interface OptionCardProps {
  icon: DiscoverIconName;
  label: string;
  hint?: string;
  selected: boolean;
  multi?: boolean;
  onPress: () => void;
}

/** Cartão de opção: ícone próprio, título, dica e marca de seleção (círculo = única, quadrado = múltipla). */
export const OptionCard = memo(function OptionCard({ icon, label, hint, selected, multi, onPress }: OptionCardProps) {
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      style={({ pressed }) => [s.option, cardShadow, selected && s.optionOn, pressed && s.pressed]}
    >
      <View style={[s.iconCircle, selected && s.iconCircleOn]}>
        <DIcon name={icon} size={30} color={dc.dark} />
      </View>
      <View style={s.optionText}>
        <Text style={s.optionLabel}>{label}</Text>
        {hint ? <Text style={s.optionHint}>{hint}</Text> : null}
      </View>
      <CheckBadge on={selected} />
    </Pressable>
  );
});

/** Chip em pílula (cidades, meses). Selecionado = verde escuro com check. */
export const Chip = memo(function Chip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: DiscoverIconName }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.chip, selected && s.chipOn, pressed && s.pressed]}
    >
      {selected ? <DIcon name="check" size={14} color="#FFFFFF" /> : icon ? <DIcon name={icon} size={16} color={dc.dark} /> : null}
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
});

/** Cartão com ilustração (praia, montanha…) e check no canto. */
export const ImageTile = memo(function ImageTile({ kind, label, selected, size, onPress }: {
  kind: Experience; label: string; selected: boolean; size: number; onPress: () => void;
}) {
  const img = size - 16;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.tile, cardShadow, { width: size }, selected && s.optionOn, pressed && s.pressed]}
    >
      <View>
        <Image source={experienceImages[kind]} style={{ width: img, height: Math.round(img * 0.78), borderRadius: 14 }} resizeMode="cover" />
        <View style={s.tileCheck}><CheckBadge on={selected} /></View>
      </View>
      <Text style={s.tileLabel}>{label}</Text>
    </Pressable>
  );
});

export function Tag({ children, tone = 'mint' }: { children: ReactNode; tone?: 'mint' | 'lime' | 'white' }) {
  return (
    <View style={[s.tag, tone === 'lime' && { backgroundColor: dc.lime }, tone === 'white' && { backgroundColor: '#FFFFFF' }]}>
      <Text style={s.tagText}>{children}</Text>
    </View>
  );
}

export function RoundButton({ icon, label, onPress, disabled }: { icon: DiscoverIconName; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.round, disabled && { opacity: 0.4 }, pressed && s.pressed]}
    >
      <DIcon name={icon} size={22} color={dc.dark} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kicker: { fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.4, color: homeColors.subtitle },
  bars: { flex: 1, flexDirection: 'row', gap: 4 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E1E3E0' },
  barOn: { backgroundColor: dc.dark },
  titleBox: { marginTop: 26, gap: 4 },
  title: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8, color: '#0B0B0B' },
  subtitle: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 24, color: dc.teal },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 72, paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 20, borderWidth: 1, borderColor: dc.border, backgroundColor: dc.card,
  },
  optionOn: { borderColor: dc.dark, borderWidth: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: dc.mint, alignItems: 'center', justifyContent: 'center' },
  iconCircleOn: { backgroundColor: dc.lime },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 22, color: dc.dark },
  optionHint: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 19, color: dc.muted },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#C9CDCB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  checkOn: { borderColor: dc.dark, backgroundColor: dc.dark },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1,
    borderColor: '#D6D9D7', backgroundColor: '#FFFFFF',
  },
  chipOn: { backgroundColor: dc.dark, borderColor: dc.dark },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: authColors.body },
  chipTextOn: { fontFamily: fonts.semibold, color: '#FFFFFF' },
  tile: { padding: 8, gap: 10, borderRadius: 20, borderWidth: 1, borderColor: dc.border, backgroundColor: dc.card },
  tileCheck: { position: 'absolute', top: 8, right: 8 },
  tileLabel: { fontFamily: fonts.bold, fontSize: 17, color: dc.dark, paddingHorizontal: 4, paddingBottom: 4 },
  tag: { backgroundColor: dc.mint, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { fontFamily: fonts.semibold, fontSize: 13, color: dc.dark },
  round: {
    width: 56, height: 56, borderRadius: 18, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', ...cardShadow,
  },
  pressed: { opacity: 0.8 },
});
