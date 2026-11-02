import { memo, useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, View } from 'react-native';
import { auroraAvatar } from './ChatIcon';
import { cc, softShadow } from './chat-theme';

function Dot({ delay }: { delay: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(v, { toValue: 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(v, { toValue: 0, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(450 - delay),
    ]));
    loop.start();
    return () => loop.stop(); // sem timers vazando ao sair da tela
  }, [v, delay]);
  return <Animated.View style={[s.dot, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) }] }]} />;
}

/** Três pontinhos animados ("Aurora está digitando"). Animação no driver nativo, sem re-render do React. */
export const TypingIndicator = memo(function TypingIndicator() {
  return (
    <View style={s.row} accessible accessibilityLabel="Aurora está digitando" accessibilityLiveRegion="polite">
      <Image source={auroraAvatar} style={s.avatar} accessible={false} />
      <View style={s.bubble}>
        <Dot delay={0} /><Dot delay={150} /><Dot delay={300} />
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: { paddingHorizontal: 14, marginVertical: 3, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: cc.mint },
  bubble: { flexDirection: 'row', gap: 5, backgroundColor: cc.received, borderRadius: 20, borderBottomLeftRadius: 6, paddingHorizontal: 16, paddingVertical: 15, ...softShadow },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: cc.teal },
});
