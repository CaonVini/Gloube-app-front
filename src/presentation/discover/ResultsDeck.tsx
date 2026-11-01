import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { NAV_FAB_WIDTH } from '../navigation';
import { fonts } from '../theme/auth-theme';
import { BackCard, DestinationCard } from './DestinationCard';
import { DetailsSheet } from './DetailsSheet';
import { DIcon } from './icons';
import { RoundButton, dc } from './ui';

interface Props {
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onToggleSave: (id: string) => void;
  onCompare: () => void;
  onRestart: () => void;
  onEditAnswers: () => void;
}

const PEEK = 24;

/**
 * Pilha de cards estilo Tinder, só para NAVEGAR: arrastar (ou os botões) vai para o anterior/próximo,
 * nada é descartado ou escolhido. O coração só favorita.
 */
export function ResultsDeck({ recs, favorites, onToggleSave, onCompare, onRestart, onEditAnswers }: Props) {
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

  const go = useCallback((dir: 1 | -1) => {
    const target = idx.current + dir;
    if (busy.current || target < 0 || target > total - 1) {
      Animated.spring(x, { toValue: 0, useNativeDriver: false, bounciness: 6 }).start();
      return;
    }
    busy.current = true;
    Animated.timing(x, { toValue: -dir * travel, duration: 190, useNativeDriver: false }).start(() => {
      setIndex(target);
      x.setValue(0);
      busy.current = false;
    });
  }, [total, travel, x]);

  const goRef = useRef(go);
  goRef.current = go;
  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
    onPanResponderMove: (_, g) => { if (!busy.current) x.setValue(g.dx); },
    onPanResponderRelease: (_, g) => {
      if (g.dx < -travel * 0.22 || g.vx < -0.5) goRef.current(1);
      else if (g.dx > travel * 0.22 || g.vx > 0.5) goRef.current(-1);
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
  const prev = index > 0 ? recs[index - 1] : undefined;
  const nextRec = index < total - 1 ? recs[index + 1] : undefined;
  const favCount = favorites.size;
  const last = index >= total - 1;
  const saved = favorites.has(current.destination.id);
  const clampIn = (a: number[], b: (number | string)[]) => x.interpolate({ inputRange: a, outputRange: b as number[], extrapolate: 'clamp' });
  const range = [-travel, 0, travel];

  return (
    <View style={s.root}>
      <Text style={s.position} accessibilityLiveRegion="polite">
        {index + 1} de {total} destinos{favCount > 0 ? `  ·  ${favCount} ${favCount === 1 ? 'salvo' : 'salvos'}` : ''}
      </Text>
      <View style={s.stage} onLayout={onLayout}>
        {area.w > 0 ? (
          <View style={{ width: cw, height: ch }}>
            {prev ? (
              <Animated.View style={[s.abs, { transform: [{ translateX: clampIn(range, [PEEK * -1, PEEK * -1, 0]) }, { rotate: clampIn(range, ['-4deg', '-4deg', '0deg']) }, { scale: clampIn(range, [0.94, 0.94, 1]) }] }]}>
                <BackCard rec={prev} width={cw} height={ch} />
              </Animated.View>
            ) : null}
            {nextRec ? (
              <Animated.View style={[s.abs, { transform: [{ translateX: clampIn(range, [0, PEEK, PEEK]) }, { rotate: clampIn(range, ['0deg', '4deg', '4deg']) }, { scale: clampIn(range, [1, 0.94, 0.94]) }] }]}>
                <BackCard rec={nextRec} width={cw} height={ch} />
              </Animated.View>
            ) : null}
            <Animated.View {...pan.panHandlers} style={[s.abs, { transform: [{ translateX: x }, { rotate: x.interpolate({ inputRange: range, outputRange: ['-7deg', '0deg', '7deg'] }) }] }]}>
              <DestinationCard rec={current} width={cw} height={ch} saved={saved} onToggleSave={onToggleSave} onDetails={setDetail} />
            </Animated.View>
          </View>
        ) : null}
      </View>
      {/* Barra de ações dividida ao redor da bola central da navbar. */}
      <View style={s.footer}>
        <View style={s.footSide}>
          <RoundButton icon="chevronLeft" label="Destino anterior" onPress={() => go(-1)} disabled={index === 0} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
            accessibilityState={{ selected: saved }}
            onPress={() => onToggleSave(current.destination.id)}
            style={({ pressed }) => [s.heartBtn, saved && s.heartBtnOn, pressed && { opacity: 0.85 }]}
          >
            <DIcon name={saved ? 'heart' : 'heartOutline'} size={26} color={saved ? '#FFFFFF' : dc.dark} />
          </Pressable>
        </View>
        <View style={{ width: NAV_FAB_WIDTH }} />
        <View style={s.footSide}>
          <View style={s.flex}>
            {last
              ? <PrimaryButton title="Comparar e escolher" onPress={onCompare} size="half" />
              : <PrimaryButton title="Próximo" onPress={() => go(1)} size="half" />}
          </View>
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
  heartBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: dc.dark, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  heartBtnOn: { backgroundColor: dc.dark },
  empty: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: dc.dark },
  emptyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: dc.muted },
});
