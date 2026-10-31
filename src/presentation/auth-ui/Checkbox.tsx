import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { authColors, fonts } from '../theme/auth-theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Texto lido por leitores de tela (o conteúdo visual pode conter links). */
  accessibilityLabel: string;
  error?: string;
  children: ReactNode;
}

export function Checkbox({ checked, onChange, accessibilityLabel, error, children }: CheckboxProps) {
  return (
    <View style={s.wrap}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={s.row}
      >
        <View style={[s.box, checked && s.boxOn, !!error && !checked && s.boxErr]}>
          {checked ? <Text style={s.tick}>✓</Text> : null}
        </View>
        <Text style={s.text}>{children}</Text>
      </Pressable>
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    </View>
  );
}

/** Link inline (teal) para usar dentro de textos. */
export const InlineLink = ({ children, onPress }: { children: ReactNode; onPress?: () => void }) => (
  <Text accessibilityRole="link" onPress={onPress} style={s.link}>{children}</Text>
);

const s = StyleSheet.create({
  wrap: { gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 18, minHeight: 44 },
  box: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: authColors.primary,
    backgroundColor: authColors.surface, alignItems: 'center', justifyContent: 'center',
  },
  boxOn: { backgroundColor: authColors.primary },
  boxErr: { borderColor: authColors.danger },
  tick: { color: '#FFFFFF', fontSize: 14, fontFamily: fonts.bold, lineHeight: 18 },
  text: { flex: 1, fontFamily: fonts.regular, fontSize: 14, lineHeight: 18, color: authColors.body },
  link: { fontFamily: fonts.medium, color: authColors.link },
  error: { fontFamily: fonts.medium, fontSize: 13, color: authColors.danger },
});
