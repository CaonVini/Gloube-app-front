import { memo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import type { Recommendation } from '../../domain/discover/types';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { discoverColors } from './ui';

const IMG_ASPECT = 400 / 640;
const MAX_COLUMN = 480;

interface Props {
  rec: Recommendation;
  width: number;
  saved: boolean;
  position: string;
  onToggleSave: (id: string) => void;
}

/** Um card = uma "página" do deck. Memoizado: só re-renderiza se o próprio card (ou salvo/não) mudar. */
export const DestinationCard = memo(function DestinationCard({ rec, width, saved, position, onToggleSave }: Props) {
  const d = rec.destination;
  const inner = Math.min(width, MAX_COLUMN + 44) - 44;
  return (
    <View style={{ width, alignItems: 'center' }}>
      <ScrollView style={{ width: inner + 44 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Image
          source={destinationImages[d.id]}
          style={{ width: inner, height: Math.round(inner * IMG_ASPECT), borderRadius: 20 }}
          resizeMode="cover"
          accessibilityRole="image"
          accessibilityLabel={`Ilustração de ${d.name}`}
        />
        <Text style={s.position}>{position}</Text>
        <Text style={s.name} accessibilityRole="header">{d.name}</Text>
        <Text style={s.country}>{d.country}</Text>
        <Text style={s.desc}>{d.description}</Text>

        <View style={s.why}>
          <Text style={s.whyTitle}>Por que combina com você</Text>
          <Text style={s.whyText}>{rec.why}</Text>
        </View>

        {rec.care.map((c) => (
          <View key={c.need} style={[s.care, c.tone === 'ok' ? s.careOk : s.careWarn]}>
            <Text style={s.careText}>{c.text}</Text>
          </View>
        ))}

        <Text style={s.disclaimer}>Valores estimados e fictícios para demonstração. Confirme preços e regras antes de reservar.</Text>
        <Text style={s.price}>~{formatBRL(rec.estimatedCost)} por pessoa</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remover ${d.name} dos favoritos` : `Salvar ${d.name} nos favoritos`}
          accessibilityState={{ selected: saved }}
          onPress={() => onToggleSave(d.id)}
          style={({ pressed }) => [s.save, saved && s.saveOn, pressed && { opacity: 0.85 }]}
        >
          <Text style={[s.saveText, saved && s.saveTextOn]}>{saved ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  content: { paddingHorizontal: 22, paddingBottom: 16, gap: 8 },
  position: { fontFamily: fonts.medium, fontSize: 13, color: authColors.muted, marginTop: 6 },
  name: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, color: authColors.text, letterSpacing: -0.4 },
  country: { fontFamily: fonts.medium, fontSize: 15, color: discoverColors.accent },
  desc: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 25, color: homeColors.subtitle },
  why: { backgroundColor: discoverColors.selectedBg, borderRadius: 16, padding: 14, gap: 4, marginTop: 6 },
  whyTitle: { fontFamily: fonts.bold, fontSize: 15, color: authColors.primary },
  whyText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: authColors.body },
  care: { borderRadius: 12, padding: 12, borderWidth: 1 },
  careOk: { backgroundColor: '#EAF4EC', borderColor: '#B9D8BF' },
  careWarn: { backgroundColor: '#FFF6E0', borderColor: '#F0D58C' },
  careText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: authColors.body },
  price: { fontFamily: fonts.bold, fontSize: 20, color: authColors.text, marginTop: 4 },
  disclaimer: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: authColors.muted, marginTop: 6 },
  save: { minHeight: 46, borderRadius: 9, borderWidth: 1.5, borderColor: authColors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  saveOn: { backgroundColor: authColors.primary },
  saveText: { fontFamily: fonts.semibold, fontSize: 16, color: authColors.primary },
  saveTextOn: { color: authColors.primaryText },
});
