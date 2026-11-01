import { Image, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '../auth-ui/Button';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { AppHeader } from './AppHeader';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const heroImage = require('../../../assets/images/home-hero.png');
const HERO_ASPECT = 718 / 1000; // altura/largura do PNG
const MAX_COLUMN = 480;
const H_PADDING = 22;

interface Props {
  firstName: string;
  fullName: string;
  onPlanTrip: () => void;
  onSignOut: () => void;
}

/** Tela inicial: saudação, chamada principal, ilustração e botão "Planejar minha viagem". UI pura (sem rede). */
export function HomeScreen({ firstName, fullName, onPlanTrip, onSignOut }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Dimensões explícitas: evita o salto de layout (e o tamanho intrínseco enorme do PNG) em RN e web.
  const heroWidth = Math.min(width, MAX_COLUMN + H_PADDING * 2) - H_PADDING * 2;
  const heroHeight = Math.round(heroWidth * HERO_ASPECT);
  return (
    <ScrollView
      style={s.flex}
      contentContainerStyle={[s.content, { paddingTop: 0, paddingBottom: Math.max(insets.bottom, 16) + 24 }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <View style={s.column}>
        <AppHeader fullName={fullName} onSignOut={onSignOut} />

        {/* Bloco central: ocupa o espaço restante e centraliza texto, ilustração e botão na vertical. */}
        <View style={s.center}>
          <View style={s.texts}>
            <Text style={s.greeting}>Bem-vindo, {firstName}</Text>
            <Text style={s.title} accessibilityRole="header">Sua próxima viagem começa aqui.</Text>
            <Text style={s.subtitle}>Escolha os lugares que você ama.{'\n'}A Aurora organiza o caminho.</Text>
          </View>

          <Image
            source={heroImage}
            style={{ width: heroWidth, height: heroHeight }}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Ilustração com passaporte, mala e mapa de viagem"
          />

          <PrimaryButton title="Planejar minha viagem" onPress={onPlanTrip} size="hero" />
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: homeColors.background },
  content: { flexGrow: 1, paddingHorizontal: H_PADDING },
  column: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center', flexGrow: 1 },
  center: { flexGrow: 1, justifyContent: 'center', gap: 26, paddingBottom: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  texts: { gap: 6 },
  greeting: { fontFamily: fonts.semibold, fontSize: 22, lineHeight: 28, color: homeColors.greeting },
  title: { fontFamily: fonts.bold, fontSize: 40, lineHeight: 44, letterSpacing: -1, color: authColors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: homeColors.subtitle, marginTop: 8 },
});
