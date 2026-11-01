import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import { buildItineraryPreview } from '../../domain/discover/choice';
import type { Answers, Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { cardShadow, dc } from './ui';

const SHOWN_DAYS = 3;

/** Prévia do roteiro do destino confirmado. A "geração" é local e curta (sem rede). */
export function ItineraryScreen({ rec, answers, onBackToChoice, onDone }: { rec: Recommendation; answers: Answers; onBackToChoice: () => void; onDone: () => void }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);
  const preview = useMemo(() => buildItineraryPreview(rec, answers), [rec, answers]);

  if (!ready) {
    return (
      <View style={s.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={dc.dark} />
        <Text style={s.loadingText}>Montando a prévia do seu roteiro em {rec.destination.name}…</Text>
      </View>
    );
  }
  const shown = preview.days.slice(0, SHOWN_DAYS);
  const more = preview.days.length - shown.length;
  return (
    <View style={s.root}>
      <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.kicker}>PRÉVIA DO ROTEIRO</Text>
        <Text style={s.title} accessibilityRole="header">{preview.title}</Text>
        <View style={[s.photoWrap, cardShadow]}>
          <Image source={destinationImages[rec.destination.id]} style={s.photo} resizeMode="cover" accessibilityLabel={`Imagem de ${rec.destination.name}`} />
        </View>
        <Text style={s.cost}>~{formatBRL(rec.estimatedCost)} <Text style={s.costNote}>por pessoa (estimativa)</Text></Text>
        {shown.map((d) => (
          <View key={d.day} style={s.day}>
            <Text style={s.dayTitle}>Dia {d.day} · {d.title}</Text>
            {d.items.map((it) => <Text key={it} style={s.item}>• {it}</Text>)}
          </View>
        ))}
        {more > 0 ? <Text style={s.more}>+ {more} {more === 1 ? 'dia' : 'dias'} no roteiro completo</Text> : null}
        {preview.notes.map((n) => <Text key={n} style={s.note}>{n}</Text>)}
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton title="Concluir" onPress={onDone} size="hero" />
        <SecondaryTextButton title="Escolher outro destino" onPress={onBackToChoice} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  flex: { flex: 1 },
  content: { gap: 10, paddingBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingText: { fontFamily: fonts.medium, fontSize: 16, color: dc.dark, textAlign: 'center' },
  kicker: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 1.8, color: dc.muted },
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
