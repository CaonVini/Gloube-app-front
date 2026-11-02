import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View, type ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QUICK_SUGGESTIONS, buildReply, typingDelay } from '../../domain/chat/aurora-replies';
import { capMessages, nextMessageId, sanitizeText, validateImage, type ChatMessage } from '../../domain/chat/messages';
import { BottomNavBar, DEFAULT_NAV_ITEMS, useNavRouting } from '../navigation';
import { useTripContext } from '../session/TripContext';
import { fonts } from '../theme/auth-theme';
import { ChatEmptyState } from './ChatEmptyState';
import { auroraAvatar, ChatIcon } from './ChatIcon';
import { Composer } from './Composer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MAX_COLUMN, cc } from './chat-theme';
import { useVoiceRecorder } from './useVoiceRecorder';

const keyOf = (m: ChatMessage) => m.id;
const NOTICE_MS = 5000;

/**
 * Chat com a Aurora (aba "Aurora"). 100% local e fictício: as mensagens ficam só em memória, nada é enviado a servidor
 * e as respostas vêm de regras simples (domain/chat/aurora-replies) usando o destino/locais da viagem em andamento.
 */
export function ChatScreen() {
  const insets = useSafeAreaInsets();
  const onNav = useNavRouting('aurora');
  const { trip } = useTripContext();
  const tripRef = useRef(trip);
  tripRef.current = trip;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => { clearTimeout(replyTimer.current); clearTimeout(noticeTimer.current); }, []);

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }, []);

  const push = useCallback((m: ChatMessage) => setMessages((prev) => capMessages([...prev, m])), []);

  // Responde à ÚLTIMA mensagem: se a pessoa manda várias seguidas, a Aurora responde uma vez só.
  const replyTo = useCallback((m: ChatMessage) => {
    clearTimeout(replyTimer.current);
    const text = buildReply(m, tripRef.current);
    setTyping(true);
    replyTimer.current = setTimeout(() => {
      push({ id: nextMessageId(), author: 'aurora', at: Date.now(), kind: 'text', text });
      setTyping(false);
    }, typingDelay(text));
  }, [push]);

  const send = useCallback((m: ChatMessage) => { push(m); replyTo(m); }, [push, replyTo]);

  const sendText = useCallback((raw: string) => {
    const text = sanitizeText(raw);
    if (text) send({ id: nextMessageId(), author: 'user', at: Date.now(), kind: 'text', text });
  }, [send]);

  const pickImage = useCallback(async (source: 'camera' | 'gallery') => {
    try {
      let res: ImagePicker.ImagePickerResult;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          showNotice(perm.canAskAgain
            ? 'Preciso da câmera para tirar a foto. Toque em Câmera de novo e permita o acesso.'
            : 'A câmera está bloqueada. Ative a permissão nas configurações do aparelho.');
          return;
        }
        res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7, exif: false });
      } else {
        // exif:false remove a localização (GPS) da foto; quality 0.7 reduz o tamanho.
        res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, exif: false, allowsMultipleSelection: false });
      }
      if (res.canceled) return;
      const a = res.assets[0];
      if (!a) return;
      const check = validateImage(a);
      if (!check.ok) { showNotice(check.reason); return; }
      send({ id: nextMessageId(), author: 'user', at: Date.now(), kind: 'image', uri: a.uri, width: a.width, height: a.height });
    } catch {
      showNotice('Não foi possível abrir a imagem. Tente de novo.');
    }
  }, [send, showNotice]);

  const rec = useVoiceRecorder({
    onRecorded: ({ uri, durationMs }) => send({ id: nextMessageId(), author: 'user', at: Date.now(), kind: 'audio', uri, durationMs }),
    onError: showNotice,
  });

  const renderItem = useCallback<ListRenderItem<ChatMessage>>(
    ({ item }) => <MessageBubble msg={item} activeAudioId={activeAudio} onAudioStart={setActiveAudio} onOpenImage={setPreview} />,
    [activeAudio],
  );

  const scrollEnd = useCallback(() => listRef.current?.scrollToEnd({ animated: true }), []);

  return (
    <View style={s.root}>
      <View style={[s.header, { paddingTop: Math.max(insets.top, 16) + 4 }]}>
        <View style={s.headerRow}>
          <Image source={auroraAvatar} style={s.headAvatar} accessibilityLabel="Foto da Aurora" />
          <View style={s.headText}>
            <Text style={s.name} accessibilityRole="header">Aurora</Text>
            <Text style={s.status} numberOfLines={1} accessibilityLiveRegion="polite">{typing ? 'digitando…' : 'Agente de viagem'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
        <View style={s.chat}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={keyOf}
            renderItem={renderItem}
            extraData={activeAudio}
            ListEmptyComponent={<ChatEmptyState suggestions={QUICK_SUGGESTIONS} onPick={sendText} />}
            ListFooterComponent={typing ? <TypingIndicator /> : undefined}
            contentContainerStyle={s.listContent}
            onContentSizeChange={scrollEnd}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            initialNumToRender={12}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
          />
        </View>

        {notice ? (
          <View style={s.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">
            <Text style={s.noticeText}>{notice}</Text>
          </View>
        ) : null}

        <View style={s.column}>
          <Composer
            onSendText={sendText}
            onPickCamera={() => pickImage('camera')}
            onPickGallery={() => pickImage('gallery')}
            recording={rec.recording}
            recordingMs={rec.durationMs}
            onStartRecording={rec.start}
            onStopRecording={rec.stopAndSend}
            onCancelRecording={rec.cancel}
          />
        </View>

        <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="aurora" onChange={onNav} />
      </KeyboardAvoidingView>

      <Modal transparent visible={preview !== null} animationType="fade" onRequestClose={() => setPreview(null)}>
        <Pressable style={s.preview} onPress={() => setPreview(null)} accessibilityRole="button" accessibilityLabel="Fechar foto">
          {preview ? <Image source={{ uri: preview }} style={s.previewImg} resizeMode="contain" /> : null}
          <View style={s.previewClose}><ChatIcon name="close" size={20} color="#FFFFFF" /></View>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: cc.bg },
  flex: { flex: 1 },
  header: { backgroundColor: '#FFFFFF', borderBottomWidth: StyleSheet.hairlineWidth, borderColor: cc.border, paddingBottom: 10 },
  headerRow: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E4EDE6' },
  headText: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 22, color: cc.dark },
  status: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 16, color: cc.teal },
  chat: { flex: 1, width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center' },
  listContent: { flexGrow: 1, paddingVertical: 10 },
  column: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center' },
  notice: { marginHorizontal: 14, marginBottom: 4, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#FBEDEC', borderWidth: 1, borderColor: '#F0C9C6', maxWidth: MAX_COLUMN - 28, alignSelf: 'stretch' },
  noticeText: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: cc.danger },
  preview: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  previewImg: { width: '100%', height: '80%' },
  previewClose: { position: 'absolute', top: 48, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
