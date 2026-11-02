import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { authColors, fonts, radius } from '../theme/auth-theme';
import { ArrowRightIcon } from './icons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** Ícone opcional à esquerda (o lado direito sempre leva a seta). */
  leftIcon?: ReactNode;
  /** 'hero': versão alta e mais arredondada, usada em chamadas principais da Home. */
  size?: 'default' | 'hero' | 'half';
}

/** Botão principal (verde escuro) com seta à direita. */
export function PrimaryButton({ title, onPress, loading, disabled, leftIcon, size = 'default' }: PrimaryButtonProps) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [s.primary, size === 'hero' && s.hero, size === 'half' && s.half, off && s.off, pressed && s.pressed]}
    >
      {/* Rótulo centralizado de verdade: ícone e seta ficam posicionados à parte e não empurram o texto. */}
      {size === 'half' || loading || !leftIcon ? null : <View pointerEvents="none" style={s.leftSlot}>{leftIcon}</View>}
      {loading ? <ActivityIndicator color={authColors.primaryText} /> : <Text style={[s.primaryText, size === 'half' ? s.primaryTextHalf : s.primaryTextPad]} numberOfLines={size === 'half' ? 2 : 1}>{title}</Text>}
      {loading ? null : <View pointerEvents="none" style={[s.rightSlot, size === 'half' && s.rightSlotHalf]}><ArrowRightIcon /></View>}
    </Pressable>
  );
}

interface SocialButtonProps {
  title: string;
  /** Texto curto exibido no botão (o `title` completo continua sendo o rótulo de acessibilidade). */
  label?: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

/** Botão de provedor social (contorno claro). */
export function SocialButton({ title, label, icon, onPress, disabled }: SocialButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.social, label ? s.socialCompact : null, disabled && s.off, pressed && s.pressed]}
    >
      {icon}
      <Text style={s.socialText}>{label ?? title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  primary: {
    minHeight: 42, borderRadius: radius.field, backgroundColor: authColors.primary, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
  },
  hero: { minHeight: 58, borderRadius: 22 },
  primaryTextHalf: { fontSize: 14, lineHeight: 17, textAlign: 'left', paddingLeft: 6 },
  half: { minHeight: 54, borderRadius: 20, paddingHorizontal: 12 },
  leftSlot: { position: 'absolute', left: 20, top: 0, bottom: 0, justifyContent: 'center' },
  rightSlot: { position: 'absolute', right: 20, top: 0, bottom: 0, justifyContent: 'center' },
  rightSlotHalf: { right: 12 },
  primaryTextPad: { paddingHorizontal: 34 },
  primaryText: { flex: 1, textAlign: 'center', color: authColors.primaryText, fontFamily: fonts.semibold, fontSize: 16 },
  social: {
    minHeight: 41, borderRadius: radius.field, borderWidth: 1, borderColor: authColors.border,
    backgroundColor: authColors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingHorizontal: 16,
  },
  socialCompact: { flex: 1, minHeight: 38, gap: 8, paddingHorizontal: 10 },
  socialText: { fontFamily: fonts.medium, fontSize: 15, color: authColors.body },
  off: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
});
