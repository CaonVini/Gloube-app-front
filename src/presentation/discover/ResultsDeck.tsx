import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { nextCardIndex } from '../../domain/discover/choice';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { NAV_FAB_WIDTH } from '../navigation';
import { fonts } from '../theme/auth-theme';
import { BackCard, DestinationCard } from './DestinationCard';
import { DetailsSheet } from './DetailsSheet';
import { DIcon } from './icons';
import { dc } from './ui';

interface Props {
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onReact: (id: string, liked: boolean) => void;
  onCompare: () => void;
  onRestart: () => void;
  onEditAnswers: () => void;
}

const PEEK = 24;

/**
 * Pilha de cards estilo Tinder, só para NAVEGAR: arrastar (ou os botões) vai para o anterior/próximo,
 * nada é descartado ou escolhido. O coração só favorita.
 */
export function ResultsDeck({ recs, favorites, onReact, onCompare, onRestart, onEditAnswers }: Props) {
    const [area, setArea] = useState({ w: 0, h: 0 });
  const [index, setIndex] = useState(0);
  const [detail, setDetail] = useState<Recommendation | null>(null);
  const x = useRef(new Animated.Value(0)).current;
  const busy = useRef(false);
  const idx = useRef(0);
  const total = recs.length;
  idx.current = index;

  const cw = Math.max(200, Math.min(area.w - PEEK * 2 - 8, 400));
  const ch = Math.max(240, area.h - 4);
  const travel = Math.max(cw, 240);

  const react = useCallback((liked: boolean) => {
    const rec = recsRef.current[idx.current];
    if (busy.current || !rec) {
      Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
      return;
    }
    busy.current = true;
    onReactRef.current(rec.destination.id, liked);
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

  if (total === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle} accessibilityRole="header">Nenhum destino coube no seu perfil</Text>
        <Text style={s.emptyText}>
          Combinamos origem, duração, orçamento e clima, e nada ficou viável. Tente aumentar os dias, ampliar o alcance ou ajustar o orçamento.
        </Text>
        <PrimaryButton title="Ajustar minhas respostas" onPress={onEditAnswers} size="hero" />
        <SecondaryTextButton title="Recomeçar" onPress={onRestart} />
      </View>
    );
  }

  const current = recs[Math.min(index, total - 1)]!;
  const nextRec = index < total - 1 ? recs[index + 1] : undefined;
  const favCount = favorites.size;
  const clampIn = (a: number[], b: (number | string)[]) => x.interpolate({ inputRange: a, outputRange: b as number[], extrapolate: 'clamp' });
  const range = [-travel, 0, travel];

  return (
    <View style={s.root}>
      <Text style={s.position} accessibilityLiveRegion="polite">
        {index + 1} de {total} destinos{favCount > 0 ? `  ·  ${favCount} ${favCount === 1 ? 'curtido' : 'curtidos'}` : ''}
      </Text>
      <View style={s.stage} onLayout={onLayout}>
        {area.w > 0 ? (
          <View style={{ width: cw, height: ch }}>
            {nextRec ? (
              <Animated.View style={[s.abs, { transform: [{ translateX: clampIn(range, [0, PEEK, 0]) }, { rotate: clampIn(range, ['0deg', '4deg', '0deg']) }, { scale: clampIn(range, [1, 0.94, 1]) }] }]}>
                <BackCard rec={nextRec} width={cw} height={ch} />
              </Animated.View>
            ) : null}
            <Animated.View {...pan.panHandlers} style={[s.abs, { transform: [{ translateX: x }, { rotate: x.interpolate({ inputRange: range, outputRange: ['-7deg', '0deg', '7deg'] }) }] }]}>
              <DestinationCard rec={current} width={cw} height={ch} onDetails={setDetail} />
              <Animated.View pointerEvents="none" style={[s.stamp, s.stampLike, { opacity: clampIn([0, travel * 0.4], [0, 1]) }]}><Text style={[s.stampText, { color: '#1B7F8C' }]}>GOSTEI</Text></Animated.View>
              <Animated.View pointerEvents="none" style={[s.stamp, s.stampNope, { opacity: clampIn([-travel * 0.4, 0], [1, 0]) }]}><Text style={[s.stampText, { color: '#B3402E' }]}>NÃO</Text></Animated.View>
            </Animated.View>
          </View>
        ) : null}
      </View>
      {/* Barra de ações dividida ao redor da bola central da navbar. */}
      <View style={s.footer}>
        <View style={[s.footSide, { justifyContent: 'center' }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Não gostei, próximo destino" onPress={() => react(false)} style={({ pressed }) => [s.actBtn, s.nopeBtn, pressed && { opacity: 0.85 }]}>
            <View style={[s.xBar, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[s.xBar, { transform: [{ rotate: '-45deg' }] }]} />
          </Pressable>
        </View>
        <View style={{ width: NAV_FAB_WIDTH }} />
        <View style={[s.footSide, { justifyContent: 'center' }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Gostei, salvar nos favoritos e ver o próximo" onPress={() => react(true)} style={({ pressed }) => [s.actBtn, s.likeBtn, pressed && { opacity: 0.85 }]}>
            <DIcon name="heart" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
      <DetailsSheet rec={detail} onClose={() => setDetail(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 2 },
  abs: { position: 'absolute', top: 0, left: 0 },
  position: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted, textAlign: 'center', paddingBottom: 6 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, width: '100%', maxWidth: 512, alignSelf: 'center' },
  footSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  actBtn: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  nopeBtn: { borderWidth: 1.5, borderColor: '#D9663F', backgroundColor: '#FFFFFF' },
  likeBtn: { backgroundColor: dc.dark },
  xBar: { position: 'absolute', width: 24, height: 3, borderRadius: 2, backgroundColor: '#D9663F' },
  stamp: { position: 'absolute', top: 54, borderWidth: 3, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
  stampText: { fontFamily: fonts.bold, fontSize: 22, letterSpacing: 1.5 },
  stampLike: { left: 18, borderColor: '#1B7F8C', transform: [{ rotate: '-12deg' }] },
  stampNope: { right: 18, borderColor: '#B3402E', transform: [{ rotate: '12deg' }] },
  empty: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: dc.dark },
  emptyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: dc.muted },
});
