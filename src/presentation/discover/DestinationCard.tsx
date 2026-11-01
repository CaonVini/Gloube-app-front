import { memo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import type { Experience, Recommendation } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { Tag, cardShadow, dc } from './ui';

const IMG_ASPECT = 0.6;
const MAX_COLUMN = 480;
const H_PAD = 16;
const EXP_LABEL: Record<Experience, string> = { praia: 'Praia', montanha: 'Montanha', cidade: 'Cidade', natureza: 'Natureza', neve: 'Neve' };
const CLIMATE_LABEL = { frio: 'Clima frio', calor: 'Clima quente', ameno: 'Clima ameno' } as const;

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
  const inner = Math.min(width, MAX_COLUMN + H_PAD * 2) - H_PAD * 2;
  return (
    <View style={{ width, alignItems: 'center' }}>
      <ScrollView style={{ width: inner + H_PAD * 2 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View>
          <Image
            source={destinationImages[d.id]}
            style={{ width: inner, height: Math.round(inner * IMG_ASPECT), borderRadius: 24 }}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={`Ilustração de ${d.name}`}
          />
          <View style={s.position}><Text style={s.positionText}>{position}</Text></View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={saved ? `Remover ${d.name} dos favoritos` : `Salvar ${d.name} nos favoritos`}
            accessibilityState={{ selected: saved }}
            onPress={() => onToggleSave(d.id)}
            style={({ pressed }) => [s.heart, saved && s.heartOn, pressed && { opacity: 0.85 }]}
          >
            <DIcon name={saved ? 'heart' : 'heartOutline'} size={24} color={saved ? '#FFFFFF' : dc.dark} />
          </Pressable>
        </View>

        <View style={s.titleBlock}>
          <Text style={s.name} accessibilityRole="header">{d.name}</Text>
          <View style={s.countryRow}>
            <DIcon name="pin" size={16} color={dc.teal} />
            <Text style={s.country}>{d.country}</Text>
          </View>
        </View>

        <View style={s.tags}>
          <Tag>{CLIMATE_LABEL[d.climate]}</Tag>
          {d.experiences.map((e) => <Tag key={e}>{EXP_LABEL[e]}</Tag>)}
          <Tag tone="lime">Mín. {d.minDays} dias</Tag>
        </View>

        <Text style={s.desc}>{d.description}</Text>

        <View style={s.why}>
          <View style={s.whyHead}>
            <View style={s.whyIcon}><DIcon name="sparkle" size={20} color={dc.dark} /></View>
            <Text style={s.whyTitle}>Por que combina com você</Text>
          </View>
          <Text style={s.whyText}>{rec.why}</Text>
        </View>

        {rec.care.map((c) => (
          <View key={c.need} style={[s.care, c.tone === 'ok' ? s.careOk : s.careWarn]}>
            <Text style={s.careText}>{c.text}</Text>
          </View>
        ))}

        <View style={s.priceCard}>
          <View style={s.priceCol}>
            <Text style={s.priceLabel}>Estimativa por pessoa</Text>
            <Text style={s.price}>~{formatBRL(rec.estimatedCost)}</Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceCol}>
            <Text style={s.priceLabel}>Passagem estimada</Text>
            <Text style={s.priceSmall}>{formatBRL(rec.transportCost)}</Text>
          </View>
        </View>
        <Text style={s.disclaimer}>Valores estimados e fictícios para demonstração. Confirme preços e regras antes de reservar.</Text>
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  content: { paddingHorizontal: H_PAD, paddingTop: 4, paddingBottom: 16, gap: 14 },
  position: { position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(31,61,54,0.82)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 5 },
  positionText: { fontFamily: fonts.semibold, fontSize: 13, color: '#FFFFFF' },
  heart: {
    position: 'absolute', top: 12, right: 12, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', ...cardShadow,
  },
  heartOn: { backgroundColor: dc.dark },
  titleBlock: { gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, color: '#0B0B0B' },
  countryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  country: { fontFamily: fonts.semibold, fontSize: 17, color: dc.teal },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  desc: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 25, color: dc.muted },
  why: { backgroundColor: dc.mint, borderRadius: 20, padding: 16, gap: 10, borderLeftWidth: 5, borderLeftColor: dc.dark },
  whyHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whyIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  whyTitle: { fontFamily: fonts.bold, fontSize: 18, color: dc.dark },
  whyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: '#2B2F2E' },
  care: { borderRadius: 16, padding: 14, borderWidth: 1 },
  careOk: { backgroundColor: '#EAF4EC', borderColor: '#B9D8BF' },
  careWarn: { backgroundColor: '#FFF6E0', borderColor: '#F0D58C' },
  careText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: '#2B2F2E' },
  priceCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: dc.border, padding: 16, ...cardShadow },
  priceCol: { flex: 1, gap: 2 },
  priceDivider: { width: 1, backgroundColor: dc.border, marginHorizontal: 14 },
  priceLabel: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  price: { fontFamily: fonts.bold, fontSize: 24, color: dc.dark },
  priceSmall: { fontFamily: fonts.bold, fontSize: 20, color: dc.dark, marginTop: 3 },
  disclaimer: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: '#6F7773' },
});
