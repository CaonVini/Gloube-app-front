import { Pressable, StyleSheet, Text } from 'react-native';
import { authColors, fonts, radius } from '../theme/auth-theme';

/** Botão de contorno claro, para ações secundárias (ex.: Voltar). */
export function SecondaryTextButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}
    >
      <Text style={s.text}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    minHeight: 46, borderRadius: radius.field, borderWidth: 1, borderColor: authColors.border,
    backgroundColor: authColors.surface, alignItems: 'center', justifyContent: 'center',
  },
  text: { fontFamily: fonts.semibold, fontSize: 16, color: authColors.text },
});
