import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../theme/auth-theme';
import { auroraAvatar } from './ChatIcon';
import { cc } from './chat-theme';

interface Props {
  suggestions: readonly string[];
  onPick: (text: string) => void;
}

/** Estado vazio: apresenta a Aurora e oferece sugestões rápidas (cada uma envia a mensagem). */
export const ChatEmptyState = memo(function ChatEmptyState({ suggestions, onPick }: Props) {
  return (
    <View style={s.wrap}>
      <Image source={auroraAvatar} style={s.avatar} accessibilityLabel="Foto da Aurora" />
      <Text style={s.title} accessibilityRole="header">Oi, eu sou a Aurora</Text>
      <Text style={s.sub}>Sua agente de viagem. Converse comigo por texto, foto ou áudio sobre o seu roteiro.</Text>
      <View style={s.chips}>
        {suggestions.map((t) => (
          <Pressable key={t} accessibilityRole="button" accessibilityLabel={`Enviar: ${t}`} onPress={() => onPick(t)} style={({ pressed }) => [s.chip, pressed && { opacity: 0.6 }]}>
            <Text style={s.chipText}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 24, gap: 10 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 6, backgroundColor: '#E4EDE6' },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4, color: cc.dark, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#4B5654', textAlign: 'center', maxWidth: 320 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: cc.teal },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: cc.teal },
});
