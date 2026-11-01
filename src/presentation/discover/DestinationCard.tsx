import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import { firstSentence } from '../../domain/discover/choice';
import type { Experience, Recommendation } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { cardShadow, dc } from './ui';

const EXP_LABEL: Record<Experience, string> = { praia: 'PRAIA', montanha: 'MONTANHA', cidade: 'CIDADE', natureza: 'NATUREZA', neve: 'NEVE' };

interface Props {
  rec: Recommendation;
  width: number;
  height: number;
  onDetails: (rec: Recommendation) => void;
}

/** Card principal da pilha: foto grande com tag, coração, nome e local; painel claro com motivo, estimativa e detalhes. */
export const DestinationCard = memo(function DestinationCard({ rec, width, height, onDetails }: Props) {
  const d = rec.destination;
  const tag = d.experiences[0] ? EXP_LABEL[d.experiences[0]] : 'DESTINO';
  return (
    <View style={[s.card, cardShadow, { width, height }]}>
      <View style={s.photo}>
        <Image source={destinationImages[d.id]} style={s.img} resizeMode="cover" accessibilityRole="image" accessibilityLabel={`Imagem de ${d.name}`} />
        <View pointerEvents="none" style={s.shade}>
          {Array.from({ length: 20 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: `rgba(8,24,20,${(0.78 * Math.pow((i + 1) / 20, 1.9)).toFixed(3)})` }} />)}
        </View>
        <View pointerEvents="none" style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
        <View pointerEvents="none" style={s.overlayText}>
          <Text style={s.name} numberOfLines={2} accessibilityRole="header">{d.name}</Text>
          <View style={s.countryRow}>
            <DIcon name="pin" size={14} color="#FFFFFF" />
            <Text style={s.country} numberOfLines={1}>{d.country}</Text>
          </View>
        </View>
      </View>
      <View style={s.panel}>
        <Text style={s.reason} numberOfLines={2}>{firstSentence(rec.why)}</Text>
        <View style={s.chips}>
          <View style={s.chip}><Text style={s.chipText}>~{formatBRL(rec.estimatedCost)} por pessoa (estimativa)</Text></View>
          <View style={s.chip}><Text style={s.chipText}>Mín. {d.minDays} dias</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes de ${d.name}`} onPress={() => onDetails(rec)} hitSlop={8}>
          <Text style={s.link}>Ver detalhes ↗</Text>
        </Pressable>
      </View>
    </View>
  );
});

/** Cartão de trás da pilha: só a foto (aparece de lado, como no Tinder). */
export const BackCard = memo(function BackCard({ rec, width, height }: { rec: Recommendation; width: number; height: number }) {
  return (
    <View style={[s.card, { width, height }]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={destinationImages[rec.destination.id]} style={s.img} resizeMode="cover" />
      <View style={s.dim} />
    </View>
  );
});

const s = StyleSheet.create({
  card: { borderRadius: 26, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  photo: { flex: 1, minHeight: 120, backgroundColor: dc.dark },
  img: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(248,245,240,0.35)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  tag: { position: 'absolute', left: 14, top: 14, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 5 },
  tagText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.1, color: dc.dark },
  overlayText: { position: 'absolute', left: 16, right: 16, bottom: 14, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: '#FFFFFF' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  country: { fontFamily: fonts.semibold, fontSize: 15, color: '#FFFFFF' },
  panel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 8, backgroundColor: '#FFFFFF' },
  reason: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: '#2B2F2E' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#F1F3F0', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: dc.dark },
  link: { fontFamily: fonts.semibold, fontSize: 13, color: dc.dark, textDecorationLine: 'underline' },
});
