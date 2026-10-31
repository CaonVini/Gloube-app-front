import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { authColors, fonts, radius } from '../theme/auth-theme';
import { ArrowRightIcon } from './icons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/** Botão principal (verde escuro) com seta à direita. */
export function PrimaryButton({ title, onPress, loading, disabled }: PrimaryButtonProps) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [s.primary, off && s.off, pressed && s.pressed]}
    >
      <View style={s.side} />
      {loading ? <ActivityIndicator color={authColors.primaryText} /> : <Text style={s.primaryText}>{title}</Text>}
      <View style={[s.side, s.arrow]}>{loading ? null : <ArrowRightIcon />}</View>
    </Pressable>
  );
}

interface SocialButtonProps {
  title: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

/** Botão de provedor social (contorno claro). */
export function SocialButton({ title, icon, onPress, disabled }: SocialButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.social, disabled && s.off, pressed && s.pressed]}
    >
      {icon}
      <Text style={s.socialText}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  primary: {
    minHeight: 42, borderRadius: radius.field, backgroundColor: authColors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  side: { width: 28 },
  arrow: { alignItems: 'flex-end' },
  primaryText: { flex: 1, textAlign: 'center', color: authColors.primaryText, fontFamily: fonts.semibold, fontSize: 16 },
  social: {
    minHeight: 41, borderRadius: radius.field, borderWidth: 1, borderColor: authColors.border,
    backgroundColor: authColors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingHorizontal: 16,
  },
  socialText: { fontFamily: fonts.medium, fontSize: 15, color: authColors.body },
  off: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
});
