import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { nextCardIndex } from '../../domain/discover/choice';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { dc } from './ui';

export interface SwipeDeckProps<T> {
  items: readonly T[];
  keyOf: (item: T) => string;
  renderFront: (item: T, width: number, height: number) => ReactNode;
  renderBack: (item: T, width: number, height: number) => ReactNode;
  /** Chamado em cada reação: gostei (direita / ♥) ou não gostei (esquerda / ✕). */
  onReact: (item: T, liked: boolean) => void;
  /** Chamado depois de reagir ao último card. */
  onFinish: () => void;
  /** Opcional: texto de posição (omitido nas telas de cards, sem contador). */
  positionText?: (index: number, total: number) => string;
  likeLabel: string;
  nopeLabel: string;
  /** Texto dos carimbos que aparecem ao arrastar. */
  likeStamp?: string;
  nopeStamp?: string;
  /** Extras à direita do indicador (ex.: "Pular"). */
  headerRight?: ReactNode;
}

const PEEK = 12;

/**
 * Pilha de cards estilo Tinder, só para NAVEGAR: arrastar (ou os botões) vai para o anterior/próximo,
 * nada é descartado ou escolhido. O coração só favorita.
 */
export function SwipeDeck<T>({ items: recs, keyOf, renderFront, renderBack, onReact, onFinish: onCompare, positionText, likeLabel, nopeLabel, likeStamp = 'GOSTEI', nopeStamp = 'NÃO', headerRight }: SwipeDeckProps<T>) {
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [index, setIndex] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);
  const idx = useRef(0);
  const total = recs.length;
  idx.current = index;

  const cw = Math.max(220, Math.min(area.w - 32, 420));
  const ch = Math.max(240, area.h - PEEK - 10);
  const backDy = PEEK + ch * 0.035; // o card de trás aparece como uma borda logo abaixo do da frente
  const travel = Math.max(cw, 240);

  const react = useCallback((liked: boolean) => {
    const rec = recsRef.current[idx.current];
    if (busy.current || !rec) {
      Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
      return;
    }
    busy.current = true;
    onReactRef.current(rec, liked);
    Animated.timing(x, { toValue: (liked ? 1 : -1) * travel * 1.4, duration: 220, useNativeDriver: false }).start(() => {
      const nxt = nextCardIndex(idx.current, recsRef.current.length);
      if (nxt === null) onCompareRef.current(); else setIndex(nxt);
      x.setValue(0);
      busy.current = false;
    });
  }, [travel, x]);

  const reactRef = useRef(react);
  reactRef.current = react;
  const recsRef = useRef(recs);
  recsRef.current = recs;
  const onReactRef = useRef(onReact);
  onReactRef.current = onReact;
  const onCompareRef = useRef(onCompare);
  onCompareRef.current = onCompare;
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
    onPanResponderMove: (_, g) => { if (!busy.current) x.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx > travel * 0.22 || g.vx > 0.5) reactRef.current(true);
      else if (g.dx < -travel * 0.22 || g.vx < -0.5) reactRef.current(false);
      else Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
    },
    onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: false }).start(),
  }), [travel, x]);

  useEffect(() => { if (index > total - 1) setIndex(Math.max(0, total - 1)); }, [index, total]);

  const onLayout = (e: LayoutChangeEvent) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const current = recs[Math.min(index, total - 1)]!;
  const nextRec = index < total - 1 ? recs[index + 1] : undefined;
  const clampIn = (a: number[], b: (number | string)[]) => x.interpolate({ inputRange: a, outputRange: b as number[], extrapolate: 'clamp' });
  const range = [-travel, 0, travel];

  return (
    <View style={s.root}>
      {positionText || headerRight ? (
        <View style={[s.posRow, headerRight ? s.posRowSplit : null]}>
          {positionText ? <Text style={s.position} accessibilityLiveRegion="polite">{positionText(index, total)}</Text> : <View />}
          {headerRight}
        </View>
      ) : null}
      <View style={s.stage} onLayout={onLayout}>
        {area.w > 0 ? (
          <View style={{ width: cw, height: ch }}>
            {nextRec ? (
              <Animated.View style={[s.abs, { transform: [{ translateY: clampIn(range, [0, backDy, 0]) }, { scale: clampIn(range, [1, 0.93, 1]) }] }]}>
                {renderBack(nextRec, cw, ch)}
              </Animated.View>
            ) : null}
            <Animated.View key={keyOf(current)} {...pan.panHandlers} style={[s.abs, { transform: [{ translateX: x }, { rotate: x.interpolate({ inputRange: range, outputRange: ['-7deg', '0deg', '7deg'] }) }] }]}>
              {renderFront(current, cw, ch)}
              <Animated.View pointerEvents="none" style={[s.stamp, s.stampLike, { opacity: clampIn([0, travel * 0.4], [0, 1]) }]}><Text style={[s.stampText, { color: '#1B7F8C' }]}>{likeStamp}</Text></Animated.View>
              <Animated.View pointerEvents="none" style={[s.stamp, s.stampNope, { opacity: clampIn([-travel * 0.4, 0], [1, 0]) }]}><Text style={[s.stampText, { color: '#B3402E' }]}>{nopeStamp}</Text></Animated.View>
            </Animated.View>
          </View>
        ) : null}
      </View>
      {/* Ações: não gostei (✕) e gostei (♥). */}
      <View style={s.footer}>
        <View style={s.footSide}>
          <Pressable accessibilityRole="button" accessibilityLabel={nopeLabel} onPress={() => react(false)} style={({ pressed }) => [s.actBtn, s.nopeBtn, pressed && { opacity: 0.85 }]}>
            <View style={[s.xBar, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[s.xBar, { transform: [{ rotate: '-45deg' }] }]} />
          </Pressable>
        </View>
        <View style={s.footSide}>
          <Pressable accessibilityRole="button" accessibilityLabel={likeLabel} onPress={() => react(true)} style={({ pressed }) => [s.actBtn, s.likeBtn, pressed && { opacity: 0.85 }]}>
            <DIcon name="heart" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  abs: { position: 'absolute', top: 0, left: 0 },
  posRowSplit: { justifyContent: 'space-between', paddingHorizontal: 22, width: '100%', maxWidth: 512, alignSelf: 'center' },
  posRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 6 },
  position: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted, textAlign: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, width: '100%', maxWidth: 512, alignSelf: 'center' },
  footSide: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  nopeBtn: { borderWidth: 1.5, borderColor: '#D9663F', backgroundColor: '#FFFFFF' },
  likeBtn: { backgroundColor: dc.dark },
  xBar: { position: 'absolute', width: 24, height: 3, borderRadius: 2, backgroundColor: '#D9663F' },
  stamp: { position: 'absolute', top: 54, borderWidth: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
  stampText: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: 1.5 },
  stampLike: { left: 18, borderColor: '#1B7F8C', transform: [{ rotate: '-12deg' }] },
  stampNope: { right: 18, borderColor: '#B3402E', transform: [{ rotate: '12deg' }] },
});
