import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fitImage, formatTime, type ChatMessage } from '../../domain/chat/messages';
import { fonts } from '../theme/auth-theme';
import { AudioBubble } from './AudioBubble';
import { cc } from './chat-theme';

const IMG_MAX_W = 230;
const IMG_MAX_H = 300;

interface Props {
  msg: ChatMessage;
  activeAudioId: string | null;
  onAudioStart: (id: string) => void;
  onOpenImage: (uri: string) => void;
}

/** Bolha de mensagem (texto, foto ou áudio) com hora. Memoizada: só re-renderiza se a mensagem ou o áudio ativo mudar. */
export const MessageBubble = memo(function MessageBubble({ msg, activeAudioId, onAudioStart, onOpenImage }: Props) {
  const mine = msg.author === 'user';
  const time = formatTime(msg.at);
  return (
    <View style={[s.row, mine ? s.rowMine : s.rowTheirs]}>
      <View style={[s.bubble, mine ? s.mine : s.theirs, msg.kind === 'image' && s.imageBubble]}>
        {msg.kind === 'text' ? (
          <Text selectable style={[s.text, { color: mine ? cc.sentText : cc.receivedText }]}>{msg.text}</Text>
        ) : msg.kind === 'image' ? (
          <Pressable accessibilityRole="imagebutton" accessibilityLabel="Foto enviada. Toque para ampliar" onPress={() => onOpenImage(msg.uri)}>
            <Image source={{ uri: msg.uri }} style={[s.image, fitImage(msg.width, msg.height, IMG_MAX_W, IMG_MAX_H)]} resizeMode="cover" />
          </Pressable>
        ) : (
          <AudioBubble id={msg.id} uri={msg.uri} durationMs={msg.durationMs} mine={mine} activeId={activeAudioId} onStart={onAudioStart} />
        )}
        <Text style={[s.time, { color: mine ? cc.sentMeta : cc.meta }, msg.kind === 'image' && s.timeImage]}>{time}</Text>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: { paddingHorizontal: 12, marginVertical: 3, flexDirection: 'row' },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, gap: 2 },
  mine: { backgroundColor: cc.sent, borderBottomRightRadius: 5 },
  theirs: { backgroundColor: cc.received, borderBottomLeftRadius: 5, borderWidth: StyleSheet.hairlineWidth, borderColor: cc.border },
  imageBubble: { padding: 4 },
  text: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 22 },
  image: { borderRadius: 14, backgroundColor: '#E4EDE6' },
  time: { fontFamily: fonts.regular, fontSize: 11, lineHeight: 14, alignSelf: 'flex-end' },
  timeImage: { paddingRight: 6, paddingBottom: 2 },
});
