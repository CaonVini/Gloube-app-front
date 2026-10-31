import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SecondaryTextButton } from './SecondaryTextButton';
import { authColors, fonts, homeColors } from '../theme/auth-theme';

/** Placeholder do planejador de viagens (ainda sem funcionalidade). */
export function PlannerPlaceholderScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: Math.max(insets.top, 47) + 20, paddingBottom: Math.max(insets.bottom, 16) + 20 }]}>
      <View style={s.body}>
        <Text style={s.title} accessibilityRole="header">Planejador de viagem</Text>
        <Text style={s.text}>Em breve a Aurora vai montar o seu roteiro por aqui.</Text>
      </View>
      <SecondaryTextButton title="Voltar" onPress={onBack} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background, paddingHorizontal: 22 },
  body: { flex: 1, justifyContent: 'center', gap: 10 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: authColors.text, letterSpacing: -0.5 },
  text: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: homeColors.subtitle },
});
