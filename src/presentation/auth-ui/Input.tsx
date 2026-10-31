import { memo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { authColors, fonts, radius } from '../theme/auth-theme';
import { EyeIcon } from './icons';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  /** Elemento à direita dentro do campo (ex.: botão de mostrar senha). */
  trailing?: ReactNode;
}

/** Campo de texto rotulado, com ícone, dica e mensagem de erro acessíveis. */
export const Input = memo(function Input({ label, icon, error, hint, trailing, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.group}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.box, focused && s.focused, !!error && s.errorBox]}>
        {icon ? <View style={s.icon}>{icon}</View> : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={authColors.placeholder}
          style={s.input}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
        />
        {trailing}
      </View>
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.error}>{error}</Text>
      ) : hint ? (
        <Text style={s.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

/** Campo de senha com alternância de visibilidade. */
export function PasswordInput(props: Omit<InputProps, 'secureTextEntry' | 'trailing' | 'icon'> & { icon?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          hitSlop={10}
          onPress={() => setVisible((v) => !v)}
          style={s.eye}
        >
          <EyeIcon off={visible} />
        </Pressable>
      }
    />
  );
}

const s = StyleSheet.create({
  group: { gap: 6 },
  label: { fontFamily: fonts.semibold, fontSize: 15, color: authColors.text },
  box: {
    flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: radius.field, borderWidth: 1,
    borderColor: authColors.border, backgroundColor: authColors.surface, paddingHorizontal: 14, gap: 12,
  },
  focused: { borderColor: authColors.link, borderWidth: 1.5 },
  errorBox: { borderColor: authColors.danger },
  icon: { width: 24, alignItems: 'center' },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: authColors.body, paddingVertical: 12 },
  eye: { padding: 2 },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: authColors.muted },
  error: { fontFamily: fonts.medium, fontSize: 13, color: authColors.danger },
});
