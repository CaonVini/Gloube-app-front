import { memo, type ReactNode } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput,
  View, type TextInputProps,
} from 'react-native';
import { colors, spacing } from '../theme/theme';

export function Screen({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.screen} keyboardShouldPersistTaps="handled">
        <View style={s.container}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export const Title = ({ children }: { children: ReactNode }) => <Text style={s.title}>{children}</Text>;
export const Muted = ({ children }: { children: ReactNode }) => <Text style={s.muted}>{children}</Text>;
export const ErrorText = ({ children }: { children?: ReactNode }) =>
  children ? <Text accessibilityRole="alert" style={s.error}>{children}</Text> : null;

interface FieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Field = memo(function Field({ label, error, style, ...rest }: FieldProps) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[s.input, error ? s.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
});

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'google' | 'facebook' | 'link' | 'outline';
}

export function Button({ title, onPress, loading, disabled, variant = 'primary' }: ButtonProps) {
  const off = disabled || loading;
  const bg = variant === 'google' ? colors.google : variant === 'facebook' ? colors.facebook : colors.primary;
  const isFlat = variant === 'link' || variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        isFlat ? (variant === 'outline' ? s.outline : s.link) : { backgroundColor: bg },
        off && s.disabled,
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isFlat ? colors.primary : colors.primaryText} />
      ) : (
        <Text style={[s.buttonText, isFlat && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export const Divider = ({ label }: { label: string }) => (
  <View style={s.divider}>
    <View style={s.line} />
    <Text style={s.muted}>{label}</Text>
    <View style={s.line} />
  </View>
);

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  screen: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  container: { width: '100%', maxWidth: 440, alignSelf: 'center', gap: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger, fontSize: 13 },
  field: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingHorizontal: spacing.md, paddingVertical: Platform.OS === 'ios' ? 12 : 9, fontSize: 16, color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  button: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  buttonText: { color: colors.primaryText, fontWeight: '600', fontSize: 16 },
  outline: { borderWidth: 1, borderColor: colors.primary },
  link: { backgroundColor: 'transparent' },
  disabled: { opacity: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
});
