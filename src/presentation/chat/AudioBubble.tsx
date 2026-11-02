import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { memo, useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDuration } from '../../domain/chat/messages';
import { fonts } from '../theme/auth-theme';
import { ChatIcon } from './ChatIcon';

interface Props {
  id: string;
  uri: string;
  durationMs: number;
  mine: boolean;
  /** Só um áudio toca por vez: o pai informa qual está ativo. */
  activeId: string | null;
  onStart: (id: string) => void;
}

/** Bolha de áudio com play/pausa e barra de progresso. O player é liberado quando a linha sai da lista. */
export const AudioBubble = memo(function AudioBubble({ id, uri, durationMs, mine, activeId, onStart }: Props) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const total = status.duration > 0 ? status.duration * 1000 : durationMs;
  const progress = total > 0 ? Math.min(1, (status.currentTime * 1000) / total) : 0;
  const fg = mine ? '#FFFFFF' : '#1F3D36';
  const track = mine ? 'rgba(255,255,255,0.3)' : '#D3E1D7';

  // Outro áudio começou: pausa este.
  useEffect(() => {
    if (activeId !== id && status.playing) player.pause();
  }, [activeId, id, status.playing, player]);

  const toggle = useCallback(async () => {
    if (status.playing) { player.pause(); return; }
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      if (status.didJustFinish || (total > 0 && status.currentTime * 1000 >= total - 100)) await player.seekTo(0);
      onStart(id);
      player.play();
    } catch { /* arquivo indisponível: nada a tocar */ }
  }, [status.playing, status.didJustFinish, status.currentTime, total, player, onStart, id]);

  const shown = status.playing || status.currentTime > 0 ? status.currentTime * 1000 : total;
  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pausar áudio' : 'Tocar áudio'}
        onPress={toggle}
        hitSlop={6}
        style={({ pressed }) => [s.btn, { backgroundColor: mine ? 'rgba(255,255,255,0.18)' : '#E4EDE6' }, pressed && s.pressed]}
      >
        <ChatIcon name={status.playing ? 'pause' : 'play'} size={16} color={fg} />
      </Pressable>
      <View style={s.mid}>
        <View style={[s.track, { backgroundColor: track }]}>
          <View style={[s.fill, { width: `${progress * 100}%`, backgroundColor: fg }]} />
        </View>
        <Text style={[s.time, { color: fg }]}>{formatDuration(shown)}</Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 200 },
  btn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  mid: { flex: 1, gap: 5 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  time: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 14 },
});
