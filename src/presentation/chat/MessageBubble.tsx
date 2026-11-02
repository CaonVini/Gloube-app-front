import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fitImage, formatTime, type ChatMessage } from '../../domain/chat/messages';
import { fonts } from '../theme/auth-theme';
import { AudioBubble } from './AudioBubble';
import { auroraAvatar, ChatIcon } from './ChatIcon';
import { cc, softShadow } from './chat-theme';

const IMG_MAX_W = 230;
const IMG_MAX_H = 300;

interface Props {
  msg: ChatMessage;
  /** Mostra o avatar da Aurora (primeira bolha de uma sequência dela). */
  showAvatar: boolean;
  activeAudioId: string | null;
  onAudioStart: (id: string) => void;
  onOpenImage: (uri: string) => void;
}

/** Dois "vistos" sobrepostos (mensagem enviada). Decorativo. */
function Ticks() {
  return (
    <View style={s.ticks} accessible={false}>
      <ChatIcon name="check" size={13} color={cc.tick} />
      <View style={s.tick2}><ChatIcon name="check" size={13} color={cc.tick} /></View>
    </View>
  );
}

/** Bolha de mensagem (texto, foto ou áudio) com hora e vistos. Memoizada: só re-renderiza se algo dela mudar. */
export const MessageBubble = memo(function MessageBubble({ msg, showAvatar, activeAudioId, onAudioStart, onOpenImage }: Props) {
  const mine = msg.author === 'user';
  const time = formatTime(msg.at);
  const isImage = msg.kind === 'image';
  return (
    <View style={[s.row, mine ? s.rowMine : s.rowTheirs]}>
      {!mine ? (
        <View style={s.avatarSlot}>{showAvatar ? <Image source={auroraAvatar} style={s.avatar} accessible={false} /> : null}</View>
      ) : null}
      <View style={[s.bubble, mine ? s.mine : s.theirs, isImage && s.imageBubble]}>
        {msg.kind === 'text' ? (
          <Text selectable style={[s.text, { color: mine ? cc.sentText : cc.receivedText }]}>{msg.text}</Text>
        ) : msg.kind === 'image' ? (
          <Pressable accessibilityRole="imagebutton" accessibilityLabel="Foto enviada. Toque para ampliar" onPress={() => onOpenImage(msg.uri)}>
            <Image source={{ uri: msg.uri }} style={[s.image, fitImage(msg.width, msg.height, IMG_MAX_W, IMG_MAX_H)]} resizeMode="cover" />
          </Pressable>
        ) : (
          <AudioBubble id={msg.id} uri={msg.uri} durationMs={msg.durationMs} mine={mine} activeId={activeAudioId} onStart={onAudioStart} />
        )}
        <View style={[s.meta, isImage && s.metaImage]}>
          <Text style={[s.time, { color: mine ? cc.sentMeta : cc.meta }]}>{time}</Text>
          {mine ? <Ticks /> : null}
        </View>
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  row: { paddingHorizontal: 14, marginVertical: 3, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },
  avatarSlot: { width: 30, height: 30 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: cc.mint },
  bubble: { maxWidth: '78%', borderRadius: 20, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 7, gap: 3 },
  mine: { backgroundColor: cc.dark, borderBottomRightRadius: 6, ...softShadow, shadowOpacity: 0.14 },
  theirs: { backgroundColor: cc.received, borderBottomLeftRadius: 6, ...softShadow },
  imageBubble: { padding: 4 },
  text: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23 },
  image: { borderRadius: 16, backgroundColor: cc.mint },
  meta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4 },
  metaImage: { paddingRight: 8, paddingBottom: 2 },
  time: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
  ticks: { flexDirection: 'row', width: 19, height: 13, alignItems: 'center' },
  tick2: { marginLeft: -7 },
});
