import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../theme/auth-theme';
import { auroraAvatar } from './ChatIcon';
import { cc, softShadow } from './chat-theme';
import { useReducedMotion } from './useReducedMotion';

const nd = Platform.OS !== 'web';

/**
 * Boas-vindas centralizadas (vertical e horizontal) entre o cabeçalho e a barra de mensagem.
 * Entrada suave (fade + escala) e um "respiro" discreto no halo; sem movimento se o sistema pedir menos animação.
 */
export const ChatEmptyState = memo(function ChatEmptyState() {
  const reduced = useReducedMotion();
  const enter = useRef(new Animated.Value(reduced ? 1 : 0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduced) { enter.setValue(1); return; }
    const intro = Animated.timing(enter, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: nd });
    intro.start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: nd }),
      Animated.timing(breathe, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: nd }),
    ]));
    loop.start();
    return () => { intro.stop(); loop.stop(); };
  }, [reduced, enter, breathe]);

  const scale = enter.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] });
  const lift = enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const haloScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] });

  return (
    <View style={s.wrap}>
      <Animated.View style={[s.block, { opacity: enter, transform: [{ translateY: lift }] }]}>
        <Animated.View style={[s.halo, { transform: [{ scale: haloScale }] }]} />
        <Animated.View style={[s.ring, { transform: [{ scale }] }]}>
          <Image source={auroraAvatar} style={s.avatar} accessibilityLabel="Foto da Aurora" />
        </Animated.View>
        <Text style={s.title} accessibilityRole="header">Olá, eu sou a Aurora</Text>
        <Text style={s.sub}>Estou aqui para tirar suas dúvidas de viagem. Escreva, envie uma foto ou grave um áudio.</Text>
      </Animated.View>
    </View>
  );
});

const s = StyleSheet.create({
  // flexGrow:1 + center: o bloco fica no meio exato do espaço livre da lista.
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 16 },
  block: { alignItems: 'center', gap: 10 },
  halo: { position: 'absolute', top: 0, width: 140, height: 140, borderRadius: 70, backgroundColor: cc.tealSoft },
  ring: { width: 120, height: 120, borderRadius: 60, marginTop: 10, marginBottom: 6, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...softShadow },
  avatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: cc.mint },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: cc.dark, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#4B5654', textAlign: 'center', maxWidth: 300 },
});
