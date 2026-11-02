import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '../theme/auth-theme';
import { auroraAvatar } from './ChatIcon';
import { cc, softShadow } from './chat-theme';

interface Props {
  suggestions: readonly string[];
  onPick: (text: string) => void;
}

/** Estado vazio acolhedor: a Aurora em destaque, o que ela faz (só dúvidas) e sugestões de perguntas. */
export const ChatEmptyState = memo(function ChatEmptyState({ suggestions, onPick }: Props) {
  return (
    <View style={s.wrap}>
      <View style={s.halo}>
        <View style={s.ring}>
          <Image source={auroraAvatar} style={s.avatar} accessibilityLabel="Foto da Aurora" />
        </View>
      </View>
      <Text style={s.title} accessibilityRole="header">Olá, eu sou a Aurora</Text>
      <Text style={s.sub}>Estou aqui para tirar suas dúvidas de viagem. Escreva, envie uma foto ou grave um áudio.</Text>
      <Text style={s.kicker}>PERGUNTE SOBRE</Text>
      <View style={s.chips}>
        {suggestions.map((t) => (
          <Pressable key={t} accessibilityRole="button" accessibilityLabel={`Perguntar: ${t}`} onPress={() => onPick(t)} style={({ pressed }) => [s.chip, pressed && { opacity: 0.6 }]}>
            <Text style={s.chipText}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 16, gap: 8 },
  halo: { width: 132, height: 132, borderRadius: 66, backgroundColor: cc.tealSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  ring: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...softShadow },
  avatar: { width: 104, height: 104, borderRadius: 52, backgroundColor: cc.mint },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: cc.dark, textAlign: 'center' },
  sub: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#4B5654', textAlign: 'center', maxWidth: 320 },
  kicker: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2, color: cc.teal, marginTop: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: cc.border, ...softShadow },
  chipText: { fontFamily: fonts.medium, fontSize: 14, color: cc.dark },
});
