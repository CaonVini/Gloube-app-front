import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authColors, fonts, radius } from '../theme/auth-theme';
import { GloubeLogo } from './GloubeLogo';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const heroImage = require('../../../assets/images/landscape.jpg');

/**
 * Moldura comum de login/cadastro: foto com logo e slogan no topo e um cartão creme
 * (cantos superiores arredondados) sobreposto. Rola com o teclado aberto e limita a largura em telas grandes.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroHeight = Math.min(Math.max(height * 0.3, 230), 340);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <ImageBackground source={heroImage} resizeMode="cover" style={[s.hero, { height: heroHeight + insets.top }]}>
          <View style={[s.heroInner, { paddingTop: insets.top + 24 }]}>
            <GloubeLogo width={150} color="#FFFFFF" />
            <Text style={s.tagline} accessibilityRole="header">O mundo espera por você.</Text>
          </View>
        </ImageBackground>
        <View style={s.card}>
          <View style={s.cardInner}>{children}</View>
          <View style={{ height: Math.max(insets.bottom, 16) }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: authColors.card },
  content: { flexGrow: 1, backgroundColor: authColors.card },
  hero: { width: '100%', backgroundColor: '#2D6F73' },
  heroInner: { flex: 1, paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 44 },
  tagline: {
    color: '#FFFFFF', fontFamily: fonts.medium, fontSize: 17,
    textShadowColor: authColors.overlay, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  card: {
    flexGrow: 1, marginTop: -radius.card, backgroundColor: authColors.card,
    borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card, paddingTop: 28, paddingHorizontal: 24,
  },
  cardInner: { width: '100%', maxWidth: 480, alignSelf: 'center' },
});
