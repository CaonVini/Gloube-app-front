import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ItineraryPreview } from '../../domain/discover/choice';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { SegmentedProgress, cardShadow, dc } from './ui';

const SHOWN_DAYS = 3;

export interface ItinerarySection {
  id: string;
  name: string;
  preview: ItineraryPreview;
  /** Ex.: "~R$ 5.000 por pessoa (estimativa)". Só quando existe estimativa. */
  costText?: string;
}

interface Props {
  sections: readonly ItinerarySection[];
  onEditPlaces: () => void;
  /** Só no fluxo Descubra: voltar a escolher outro destino. */
  onBackToChoice?: () => void;
  onDone: () => void;
}

/** Prévia do roteiro baseada nos locais escolhidos. A "geração" é local e curta (sem rede). */
export function ItineraryScreen({ sections, onEditPlaces, onBackToChoice, onDone }: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <View style={s.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={dc.dark} />
        <Text style={s.loadingText}>Montando a prévia do seu roteiro…</Text>
      </View>
    );
  }
  const single = sections.length === 1;
  return (
    <View style={s.root}>
      <SegmentedProgress kicker="ROTEIRO" current={2} total={2} />
      <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.kicker}>PRÉVIA DO ROTEIRO</Text>
        {single ? null : <Text style={s.title} accessibilityRole="header">Seu roteiro</Text>}
        {sections.map((sec) => {
          const shown = sec.preview.days.slice(0, SHOWN_DAYS);
          const more = sec.preview.days.length - shown.length;
          const img = destinationImages[sec.id];
          return (
            <View key={sec.id} style={s.section}>
              <Text style={single ? s.title : s.sectionTitle} accessibilityRole="header">{sec.preview.title}</Text>
              {img ? (
                <View style={[s.photoWrap, cardShadow]}>
                  <Image source={img} style={s.photo} resizeMode="cover" accessibilityLabel={`Imagem de ${sec.name}`} />
                </View>
              ) : null}
              {sec.costText ? <Text style={s.cost}>{sec.costText}</Text> : null}
              {shown.map((d) => (
                <View key={d.day} style={s.day}>
                  <Text style={s.dayTitle}>Dia {d.day} · {d.title}</Text>
                  {d.items.map((it) => <Text key={it} style={s.item}>• {it}</Text>)}
                </View>
              ))}
              {more > 0 ? <Text style={s.more}>+ {more} {more === 1 ? 'dia' : 'dias'} no roteiro completo</Text> : null}
            </View>
          );
        })}
        {Array.from(new Set(sections.flatMap((x) => x.preview.notes))).map((n) => <Text key={n} style={s.note}>{n}</Text>)}
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton title="Concluir" onPress={onDone} size="hero" />
        <SecondaryTextButton title="Editar locais" onPress={onEditPlaces} />
        {onBackToChoice ? <SecondaryTextButton title="Escolher outro destino" onPress={onBackToChoice} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16, gap: 8 },
  flex: { flex: 1 },
  content: { gap: 10, paddingBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingText: { fontFamily: fonts.medium, fontSize: 16, color: dc.dark, textAlign: 'center' },
  kicker: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.8, color: dc.muted },
  section: { gap: 10 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, color: dc.dark },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 31, letterSpacing: -0.5, color: '#0B0B0B' },
  photoWrap: { borderRadius: 22, overflow: 'hidden', backgroundColor: dc.dark },
  photo: { width: '100%', height: 150 },
  cost: { fontFamily: fonts.bold, fontSize: 18, color: dc.dark },
  costNote: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  day: { borderRadius: 16, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', padding: 12, gap: 3 },
  dayTitle: { fontFamily: fonts.semibold, fontSize: 15, color: dc.dark },
  item: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: '#2B2F2E' },
  more: { fontFamily: fonts.medium, fontSize: 13, color: dc.teal },
  note: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: dc.muted },
  footer: { gap: 4, paddingTop: 8, paddingBottom: 8 },
});
