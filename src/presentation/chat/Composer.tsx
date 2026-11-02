import { memo, useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAX_TEXT_LENGTH, canSend, formatDuration, sanitizeText } from '../../domain/chat/messages';
import { authColors, fonts } from '../theme/auth-theme';
import { ChatIcon } from './ChatIcon';
import { cc } from './chat-theme';

const MIN_INPUT = 28;
const MAX_INPUT = 104;

interface Props {
  onSendText: (text: string) => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
  recording: boolean;
  recordingMs: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
}

/** Campo de mensagem estilo WhatsApp: anexo (câmera/galeria), texto, e microfone (vira "enviar" quando há texto). */
export const Composer = memo(function Composer(p: Props) {
  const [text, setText] = useState('');
  const [sheet, setSheet] = useState(false);
  const [inputH, setInputH] = useState(MIN_INPUT);
  const insets = useSafeAreaInsets();

  const send = useCallback(() => {
    if (!canSend(text)) return;
    p.onSendText(sanitizeText(text));
    setText('');
    setInputH(MIN_INPUT);
  }, [text, p]);

  const pick = useCallback((fn: () => void) => { setSheet(false); fn(); }, []);

  if (p.recording) {
    return (
      <View style={s.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cancelar gravação" onPress={p.onCancelRecording} hitSlop={8} style={s.round}>
          <ChatIcon name="close" size={18} color={cc.danger} />
        </Pressable>
        <View style={[s.field, s.recField]} accessibilityLiveRegion="polite">
          <View style={s.redDot} />
          <Text style={s.recText}>Gravando {formatDuration(p.recordingMs)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Parar e enviar áudio" onPress={p.onStopRecording} style={[s.action, { backgroundColor: cc.dark }]}>
          <ChatIcon name="send" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  const hasText = canSend(text);
  return (
    <View style={s.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Anexar foto" onPress={() => setSheet(true)} hitSlop={8} style={s.round}>
        <ChatIcon name="plus" size={22} color={cc.dark} />
      </Pressable>
      <View style={s.field}>
        <TextInput
          accessibilityLabel="Mensagem para a Aurora"
          placeholder="Mensagem"
          placeholderTextColor={authColors.placeholder}
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={1}
          onContentSizeChange={(e) => setInputH(Math.min(MAX_INPUT, Math.max(MIN_INPUT, Math.ceil(e.nativeEvent.contentSize.height))))}
          maxLength={MAX_TEXT_LENGTH}
          style={[s.input, { height: inputH }]}
          submitBehavior="newline"
        />
      </View>
      {hasText ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Enviar mensagem" onPress={send} style={[s.action, { backgroundColor: cc.dark }]}>
          <ChatIcon name="send" size={20} color="#FFFFFF" />
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="Gravar áudio" onPress={p.onStartRecording} style={[s.action, { backgroundColor: cc.teal }]}>
          <ChatIcon name="mic" size={20} color="#FFFFFF" />
        </Pressable>
      )}

      <Modal transparent visible={sheet} animationType="fade" onRequestClose={() => setSheet(false)}>
        <Pressable style={s.backdrop} onPress={() => setSheet(false)} accessibilityLabel="Fechar opções de anexo">
          <View style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <Option icon="camera" label="Câmera" onPress={() => pick(p.onPickCamera)} />
            <Option icon="gallery" label="Galeria" onPress={() => pick(p.onPickGallery)} />
            <Pressable accessibilityRole="button" onPress={() => setSheet(false)} style={s.cancel}><Text style={s.cancelText}>Cancelar</Text></Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

function Option({ icon, label, onPress }: { icon: 'camera' | 'gallery'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [s.option, pressed && { opacity: 0.6 }]}>
      <View style={s.optionIcon}><ChatIcon name={icon} size={22} color={cc.dark} /></View>
      <Text style={s.optionText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: cc.bg },
  round: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  field: { flex: 1, minHeight: 44, maxHeight: 128, paddingVertical: 8, borderRadius: 22, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: authColors.border, paddingHorizontal: 16, justifyContent: 'center' },
  input: { fontFamily: fonts.regular, fontSize: 16, color: authColors.body, paddingVertical: 0, outlineStyle: 'none' } as never,
  action: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  recField: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  redDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: cc.danger },
  recText: { fontFamily: fonts.medium, fontSize: 15, color: authColors.body },
  backdrop: { flex: 1, backgroundColor: authColors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingHorizontal: 16, gap: 4, width: '100%', maxWidth: 512, alignSelf: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  optionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E4EDE6', alignItems: 'center', justifyContent: 'center' },
  optionText: { fontFamily: fonts.semibold, fontSize: 16, color: cc.dark },
  cancel: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontFamily: fonts.semibold, fontSize: 16, color: cc.teal },
});
