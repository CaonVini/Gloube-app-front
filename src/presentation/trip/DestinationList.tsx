import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { reorderTarget, shiftFor, type Destination } from '../../domain/trip-plan';
import { authColors, fonts } from '../theme/auth-theme';
import { TripIcon } from './TripIcon';

const GAP = 10;

/** Altura exata da lista: n linhas + n-1 espaços (nada sobra, a lista não força espaço em branco). */
export function listHeight(count: number, rowHeight: number): number {
  return count <= 0 ? 0 : count * rowHeight + (count - 1) * GAP;
}
const BADGE_COL = 44;
const FIELD_BG = '#F3F1EC';
const BADGE_BG = '#D3E4D8';

interface Props {
  items: readonly Destination[];
  rowHeight: number;
  onReorder: (from: number, to: number) => void;
  onRemove: (id: string) => void;
  /** Avisa o pai para travar a rolagem enquanto arrasta. */
  onDragging?: (dragging: boolean) => void;
}

interface RowProps {
  item: Destination;
  index: number;
  count: number;
  rowHeight: number;
  shift: number;
  dragging: boolean;
  dy: Animated.Value;
  onStart: (index: number) => void;
  onMove: (index: number, dy: number) => void;
  onEnd: (index: number, dy: number) => void;
  onNudge: (index: number, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
}

const Row = memo(function Row({ item, index, count, rowHeight, shift, dragging, dy, onStart, onMove, onEnd, onNudge, onRemove }: RowProps) {
  const pitch = rowHeight + GAP;
  const sh = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(sh, { toValue: shift * pitch, duration: 140, useNativeDriver: false }).start();
  }, [shift, pitch, sh]);

  const live = useRef({ index, onStart, onMove, onEnd });
  live.current = { index, onStart, onMove, onEnd };
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => live.current.onStart(live.current.index),
    onPanResponderMove: (_, g) => live.current.onMove(live.current.index, g.dy),
    onPanResponderRelease: (_, g) => live.current.onEnd(live.current.index, g.dy),
    onPanResponderTerminate: (_, g) => live.current.onEnd(live.current.index, g.dy),
  }), []);

  const label = `${item.city}, ${item.country}`;
  return (
    <Animated.View
      style={[s.row, { top: index * pitch, height: rowHeight, zIndex: dragging ? 10 : 1 }, dragging ? s.lifted : null, { transform: [{ translateY: dragging ? dy : sh }, { scale: dragging ? 1.02 : 1 }] }]}
    >
      <View style={s.pinCircle}><TripIcon name="pin" size={14} color={authColors.text} /></View>
      <View style={s.text}>
        <Text style={s.city} numberOfLines={1}>{item.city}</Text>
        <Text style={s.country} numberOfLines={1}>{item.country}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${label}`} onPress={() => onRemove(item.id)} hitSlop={6} style={({ pressed }) => [s.remove, pressed && s.pressed]}>
        <TripIcon name="close" size={14} color={authColors.placeholder} />
      </Pressable>
      <View
        {...pan.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Reordenar ${label}, posição ${index + 1} de ${count}`}
        accessibilityHint="Arraste para mudar a ordem. Com leitor de tela, use as ações mover para cima ou para baixo."
        accessibilityActions={[{ name: 'decrement', label: 'Mover para cima' }, { name: 'increment', label: 'Mover para baixo' }]}
        onAccessibilityAction={(e) => { if (e.nativeEvent.actionName === 'decrement') onNudge(index, -1); else if (e.nativeEvent.actionName === 'increment') onNudge(index, 1); }}
        {...({ onKeyDown: (e: { key: string; preventDefault?: () => void }) => { if (e.key === 'ArrowUp') { e.preventDefault?.(); onNudge(index, -1); } else if (e.key === 'ArrowDown') { e.preventDefault?.(); onNudge(index, 1); } }, tabIndex: 0 } as object)}
        style={[s.handle, count < 2 && s.off]}
      >
        <TripIcon name="grip" size={22} color={authColors.placeholder} />
      </View>
    </Animated.View>
  );
});

/** Lista numerada de destinos com arrastar e soltar. Os números são das posições (renumeram sozinhos ao soltar). */
export const DestinationList = memo(function DestinationList({ items, rowHeight, onReorder, onRemove, onDragging }: Props) {
  const pitch = rowHeight + GAP;
  const n = items.length;
  const dy = useRef(new Animated.Value(0)).current;
  const [drag, setDrag] = useState<{ from: number; over: number } | null>(null);
  const dragRef = useRef(drag);
  dragRef.current = drag;

  const onStart = (index: number) => { dy.setValue(0); setDrag({ from: index, over: index }); onDragging?.(true); };
  const onMove = (index: number, d: number) => {
    // limita o arrasto à lista e acompanha o dedo/mouse
    const min = -index * pitch;
    const max = (n - 1 - index) * pitch;
    dy.setValue(Math.max(min, Math.min(max, d)));
    const over = reorderTarget(index, d, pitch, n);
    if (dragRef.current && dragRef.current.over !== over) setDrag({ from: index, over });
  };
  const onEnd = (index: number, d: number) => {
    const over = reorderTarget(index, d, pitch, n);
    Animated.timing(dy, { toValue: (over - index) * pitch, duration: 110, useNativeDriver: false }).start(() => {
      if (over !== index) onReorder(index, over);
      dy.setValue(0);
      setDrag(null);
      onDragging?.(false);
    });
  };
  const onNudge = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to >= 0 && to < n) onReorder(index, to);
  };

  const height = listHeight(n, rowHeight);
  return (
    <View style={{ height }}>
      {items.map((d, i) => (
        <View key={`b-${d.id}`} pointerEvents="none" style={[s.badgeWrap, { top: i * pitch, height: rowHeight }]}>
          <View style={s.badge}><Text style={s.badgeText}>{i + 1}</Text></View>
          {i < n - 1 ? <View style={[s.sep, { top: rowHeight / 2 + 20, height: pitch - 40 }]} /> : null}
        </View>
      ))}
      {items.map((d, i) => (
        <Row
          key={d.id}
          item={d}
          index={i}
          count={n}
          rowHeight={rowHeight}
          shift={drag ? shiftFor(i, drag.from, drag.over) : 0}
          dragging={drag?.from === i}
          dy={dy}
          onStart={onStart}
          onMove={onMove}
          onEnd={onEnd}
          onNudge={onNudge}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  badgeWrap: { position: 'absolute', left: 0, width: BADGE_COL, alignItems: 'center', justifyContent: 'center' },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: BADGE_BG, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: fonts.bold, fontSize: 15, color: authColors.text },
  sep: { position: 'absolute', width: 0, borderLeftWidth: 2, borderStyle: 'dotted', borderColor: authColors.link },
  row: { position: 'absolute', left: BADGE_COL + 8, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, backgroundColor: FIELD_BG, paddingLeft: 12 },
  lifted: { backgroundColor: '#FFFFFF', shadowColor: '#1F3D36', shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8, borderWidth: 1, borderColor: '#D3E1D7' },
  pinCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#D3E1D7', alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  city: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 18, color: '#111' },
  country: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 15, color: authColors.link },
  remove: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 44, height: '100%', alignItems: 'center', justifyContent: 'center', cursor: 'grab' } as object,
  pressed: { opacity: 0.6 },
  off: { opacity: 0.4 },
});
