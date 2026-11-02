import type React from 'react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { MAX_AUDIO_MS, MAX_TEXT_LENGTH, canSend, formatDuration, sanitizeText } from '../../domain/chat/messages';
import { meterToLevel } from '../../domain/chat/waveform';
import { authColors, fonts } from '../theme/auth-theme';
import { ChatIcon } from './ChatIcon';
import { PressableScale } from './PressableScale';
import { Waveform } from './Waveform';
import { cc, softShadow } from './chat-theme';
import { useReducedMotion } from './useReducedMotion';

const MIN_INPUT = 28;
const MAX_INPUT = 112; // ~5 linhas
const COUNTER_FROM = 800;

interface Props {
  onSendText: (text: string) => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
  recording: boolean;
  recordingMs: number;
  /** Nível do microfone em dBFS (opcional). */
  metering?: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}

/** Botão redondo que dá uma "pulada" curta ao trocar de função (mic <-> enviar). */
function SwapButton({ mode, onPress, label, bg, children }: { mode: string; onPress: () => void; label: string; bg: string; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    v.setValue(0.6);
    Animated.spring(v, { toValue: 1, speed: 24, bounciness: 10, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [mode, reduced, v]);
  return (
    <Animated.View style={{ transform: [{ scale: v }] }}>
      <PressableScale accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.action, { backgroundColor: bg }]}>
        {children}
      </PressableScale>
    </Animated.View>
  );
}

/** Campo de mensagem: + (câmera/galeria), texto que cresce, e microfone que vira "enviar" quando há texto. */
export const Composer = memo(function Composer(p: Props) {
  const [text, setText] = useState('');
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [inputH, setInputH] = useState(MIN_INPUT);
  const plusRef = useRef<React.ComponentRef<typeof View>>(null);
  const { height: winH } = useWindowDimensions();
  const reduced = useReducedMotion();

  const send = useCallback(() => {
    if (!canSend(text)) return;
    p.onSendText(sanitizeText(text));
    setText('');
    setInputH(MIN_INPUT);
  }, [text, p]);

  const openMenu = useCallback(() => {
    plusRef.current?.measureInWindow((x: number, y: number) => setMenu({ x, y }));
  }, []);
  const closeMenu = useCallback(() => setMenu(null), []);
  const pick = useCallback((fn: () => void) => { setMenu(null); fn(); }, []);

  if (p.recording) {
    const left = Math.max(0, MAX_AUDIO_MS - p.recordingMs);
    return (
      <View style={s.bar}>
        <PressableScale accessibilityRole="button" accessibilityLabel="Cancelar gravação" onPress={p.onCancelRecording} hitSlop={8} style={[s.round, s.roundDanger]}>
          <ChatIcon name="close" size={18} color={cc.danger} />
        </PressableScale>
        <View style={[s.field, s.recField]} accessibilityLiveRegion="polite" accessibilityLabel={`Gravando ${formatDuration(p.recordingMs)}`}>
          <PulseDot still={reduced} />
          <Text style={s.recText}>{formatDuration(p.recordingMs)}</Text>
          <Waveform level={p.metering === undefined ? undefined : meterToLevel(p.metering)} still={reduced} />
          {left < 15_000 ? <Text style={s.recLeft}>{formatDuration(left)}</Text> : null}
        </View>
        <SwapButton mode="rec-send" label="Parar e enviar áudio" bg={cc.dark} onPress={p.onStopRecording}>
          <ChatIcon name="send" size={20} color="#FFFFFF" />
        </SwapButton>
      </View>
    );
  }

  const hasText = canSend(text);
  const onKeyPress = Platform.OS === 'web'
    ? (e: { nativeEvent: { key: string; shiftKey?: boolean }; preventDefault?: () => void }) => {
        // Web: Enter envia, Shift+Enter quebra a linha.
        if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) { e.preventDefault?.(); send(); }
      }
    : undefined;
  return (
    <View>
      {text.length >= COUNTER_FROM ? <Text style={[s.counter, text.length >= MAX_TEXT_LENGTH && { color: cc.danger }]} accessibilityLiveRegion="polite">{text.length}/{MAX_TEXT_LENGTH}</Text> : null}
      <View style={s.bar}>
        <View ref={plusRef} collapsable={false}>
          <PressableScale accessibilityRole="button" accessibilityLabel="Anexar foto" accessibilityState={{ expanded: !!menu }} onPress={openMenu} hitSlop={8} style={s.round}>
            <ChatIcon name="plus" size={22} color={cc.dark} />
          </PressableScale>
        </View>
        <View style={s.field}>
          <TextInput
            accessibilityLabel="Mensagem para a Aurora"
            placeholder="Pergunte à Aurora…"
            placeholderTextColor={authColors.placeholder}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={1}
            onContentSizeChange={(e) => setInputH(Math.min(MAX_INPUT, Math.max(MIN_INPUT, Math.ceil(e.nativeEvent.contentSize.height))))}
            maxLength={MAX_TEXT_LENGTH}
            style={[s.input, { height: inputH }]}
            submitBehavior="newline"
            onKeyPress={onKeyPress as never}
          />
        </View>
        {hasText ? (
          <SwapButton mode="send" label="Enviar mensagem" bg={cc.dark} onPress={send}><ChatIcon name="send" size={20} color="#FFFFFF" /></SwapButton>
        ) : (
          <SwapButton mode="mic" label="Gravar áudio" bg={cc.teal} onPress={p.onStartRecording}><ChatIcon name="mic" size={20} color="#FFFFFF" /></SwapButton>
        )}
      </View>

      <Modal transparent visible={!!menu} animationType="none" onRequestClose={closeMenu}>
        <Pressable style={s.backdrop} onPress={closeMenu} accessibilityLabel="Fechar menu de anexo">
          {menu ? (
            <Popover left={Math.max(12, menu.x)} bottom={Math.max(12, winH - menu.y + 10)} still={reduced}>
              <Option icon="camera" label="Câmera" onPress={() => pick(p.onPickCamera)} />
              <Option icon="gallery" label="Galeria" onPress={() => pick(p.onPickGallery)} />
            </Popover>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
});

function PulseDot({ still }: { still: boolean }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (still) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 0.3, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(v, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, still]);
  return <Animated.View style={[s.redDot, { opacity: v }]} />;
}

/** Cartão flutuante ancorado no botão +, com entrada suave (fade + subida). */
function Popover({ left, bottom, still, children }: { left: number; bottom: number; still: boolean; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(still ? 1 : 0)).current;
  useEffect(() => {
    if (still) return;
    Animated.timing(v, { toValue: 1, duration: 160, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [v, still]);
  return (
    <Animated.View style={[s.popover, { left, bottom, opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

function Option({ icon, label, onPress }: { icon: 'camera' | 'gallery'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.option, pressed && { backgroundColor: cc.mint }]}>
      <View style={s.optionIcon}><ChatIcon name={icon} size={20} color={cc.dark} /></View>
      <Text style={s.optionText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, backgroundColor: cc.bg },
  round: { width: 44, height: 44, borderRadius: 22, backgroundColor: cc.mint, alignItems: 'center', justifyContent: 'center' },
  roundDanger: { backgroundColor: '#FBEDEC' },
  field: { flex: 1, minHeight: 44, maxHeight: 136, paddingVertical: 8, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: cc.border, paddingHorizontal: 18, justifyContent: 'center', ...softShadow },
  input: { fontFamily: fonts.regular, fontSize: 16, color: authColors.body, paddingVertical: 0, outlineStyle: 'none' } as never,
  action: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', ...softShadow },
  recField: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: cc.danger },
  recText: { fontFamily: fonts.semibold, fontSize: 15, color: authColors.body, minWidth: 34 },
  recLeft: { fontFamily: fonts.medium, fontSize: 12, color: cc.danger },
  counter: { alignSelf: 'flex-end', paddingRight: 20, fontFamily: fonts.medium, fontSize: 12, color: cc.meta },
  backdrop: { flex: 1, backgroundColor: 'rgba(31,61,54,0.18)' },
  popover: { position: 'absolute', minWidth: 190, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: cc.border, ...softShadow, shadowOpacity: 0.16, shadowRadius: 16 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12 },
  optionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: cc.mint, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontFamily: fonts.semibold, fontSize: 15, color: cc.dark },
});
