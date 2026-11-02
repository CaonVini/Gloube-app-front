import { memo, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WAVE_BARS, barHeight, pushLevel } from '../../domain/chat/waveform';
import { cc } from './chat-theme';

/**
 * Onda ao vivo da gravação. Recebe o nível atual (0..1) a cada ~200 ms e guarda um histórico curto.
 * Se o aparelho não informar o nível (undefined), mostra uma ondulação suave só como sinal de "gravando".
 */
export const Waveform = memo(function Waveform({ level, still }: { level: number | undefined; still: boolean }) {
  const [bars, setBars] = useState<number[]>(() => Array(WAVE_BARS).fill(0));
  const tick = useRef(0);
  useEffect(() => {
    tick.current += 1;
    const lv = level ?? (still ? 0.15 : 0.25 + 0.2 * Math.abs(Math.sin(tick.current / 2)));
    setBars((prev) => pushLevel(prev, lv));
  }, [level, still]);
  return (
    <View style={s.row} accessible={false} importantForAccessibility="no-hide-descendants">
      {bars.map((b, i) => <View key={i} style={[s.bar, { height: barHeight(b), opacity: 0.35 + 0.65 * (i / WAVE_BARS) }]} />)}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flex: 1, height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  bar: { width: 3, borderRadius: 2, backgroundColor: cc.teal },
});
