import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { experienceImages } from './assets';
import type { Experience } from '../../domain/discover/types';

export const discoverColors = { selectedBg: '#E4EDE6', accent: authColors.link } as const;

export function ProgressBar({ fraction, label }: { fraction: number; label: string }) {
  const pct = Math.round(fraction * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={s.track}
    >
      <View style={[s.fill, { width: `${pct}%` }]} />
    </View>
  );
}

interface OptionRowProps {
  label: string;
  hint?: string;
  selected: boolean;
  multi?: boolean;
  onPress: () => void;
}

/** Linha selecionável. `multi` usa papel "checkbox"; senão "radio" (leitores de tela anunciam certo). */
export const OptionRow = memo(function OptionRow({ label, hint, selected, multi, onPress }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={onPress}
      style={({ pressed }) => [s.row, selected && s.rowSelected, pressed && s.pressed]}
    >
      <View style={[s.mark, multi && s.markSquare, selected && s.markOn]}>{selected ? <View style={s.markDot} /> : null}</View>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{label}</Text>
        {hint ? <Text style={s.rowHint}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
});

export const Chip = memo(function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.chip, selected && s.chipSelected, pressed && s.pressed]}
    >
      <Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
});

export const ImageTile = memo(function ImageTile({ kind, label, selected, size, onPress }: {
  kind: Experience; label: string; selected: boolean; size: number; onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [s.tile, { width: size }, selected && s.tileSelected, pressed && s.pressed]}
    >
      <Image source={experienceImages[kind]} style={{ width: size - 4, height: size - 4, borderRadius: 14 }} resizeMode="cover" />
      <View style={s.tileLabelRow}>
        <View style={[s.mark, s.markSquare, selected && s.markOn]}>{selected ? <View style={s.markDot} /> : null}</View>
        <Text style={s.tileLabel}>{label}</Text>
      </View>
    </Pressable>
  );
});

const s = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: '#E7E4DD', overflow: 'hidden', flex: 1 },
  fill: { height: 6, borderRadius: 3, backgroundColor: authColors.primary },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1, borderColor: authColors.border, backgroundColor: authColors.surface,
  },
  rowSelected: { borderColor: authColors.primary, borderWidth: 1.5, backgroundColor: discoverColors.selectedBg },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontFamily: fonts.semibold, fontSize: 16, color: authColors.text },
  rowHint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: homeColors.subtitle },
  mark: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: authColors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: authColors.surface },
  markSquare: { borderRadius: 6 },
  markOn: { borderColor: authColors.primary, backgroundColor: authColors.primary },
  markDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  chip: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: authColors.border, backgroundColor: authColors.surface },
  chipSelected: { borderColor: authColors.primary, backgroundColor: discoverColors.selectedBg, borderWidth: 1.5 },
  chipText: { fontFamily: fonts.medium, fontSize: 15, color: authColors.body },
  chipTextSelected: { fontFamily: fonts.semibold, color: authColors.primary },
  tile: { borderRadius: 16, borderWidth: 1, borderColor: authColors.border, backgroundColor: authColors.surface, padding: 1, gap: 8, paddingBottom: 10 },
  tileSelected: { borderColor: authColors.primary, borderWidth: 2, padding: 0 },
  tileLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10 },
  tileLabel: { fontFamily: fonts.semibold, fontSize: 15, color: authColors.text },
  pressed: { opacity: 0.85 },
});
