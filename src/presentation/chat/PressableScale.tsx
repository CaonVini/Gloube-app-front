import { useCallback, useRef, type ReactNode } from 'react';
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Botão com leve escala ao toque (mola curta, driver nativo). Sem animação se o sistema pede menos movimento. */
export function PressableScale({ style, children, onPressIn, onPressOut, ...rest }: Props) {
  const v = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  const to = useCallback((x: number) => {
    if (reduced) return;
    Animated.spring(v, { toValue: x, speed: 40, bounciness: 6, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v, reduced]);
  return (
    <Pressable {...rest} onPressIn={(e) => { to(0.9); onPressIn?.(e); }} onPressOut={(e) => { to(1); onPressOut?.(e); }}>
      <Animated.View style={[style, { transform: [{ scale: v }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
