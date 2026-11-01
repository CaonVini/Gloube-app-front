import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { buildComparison, comparisonHighlights } from '../../domain/discover/compare';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { Tag, cardShadow, dc } from './ui';

const CARD_W = 270;

interface Props {
  favorites: readonly Recommendation[];
  chosenId: string | null;
  onChoose: (id: string) => void;
  onBack: () => void;
}

/** Comparação dos favoritos: um cartão por destino (rolagem horizontal), com as mesmas linhas em todos. */
export function CompareScreen({ favorites, chosenId, onChoose, onBack }: Props) {
  const { height } = useWindowDimensions();
  const compact = height < 800;
  // Em telas baixas, esconde as linhas menos decisivas para nada ficar cortado.
  const rows = buildComparison(favorites).filter((r) => !compact || !['Passagem estimada', 'Melhor época'].includes(r.label));
  const { cheapestId, shortestId } = comparisonHighlights(favorites);
  const chosen = favorites.find((r) => r.destination.id === chosenId);
  return (
    <View style={s.root}>
      <View style={s.head}>
        <Text style={s.title} accessibilityRole="header">Compare seus favoritos</Text>
        {chosen ? (
          <View style={s.banner} accessibilityLiveRegion="polite">
            <DIcon name="check" size={18} color={dc.dark} />
            <Text style={s.bannerText}>Você escolheu {chosen.destination.name}. Próximo passo: planejar com a Aurora (em breve).</Text>
          </View>
        ) : (
          <Text style={s.subtitle}>Escolha o que mais combina com você.</Text>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cards} style={s.flex}>
        {favorites.map((r, i) => {
          const id = r.destination.id;
          const on = id === chosenId;
          return (
            <ScrollView key={id} style={[s.card, on && s.cardOn]} contentContainerStyle={s.cardInner} showsVerticalScrollIndicator={false}>
              <Image source={destinationImages[id]} style={s.photo} resizeMode="cover" />
              <Text style={s.name} numberOfLines={2}>{r.destination.name}</Text>
              <View style={s.tags}>
                {id === cheapestId ? <Tag tone="lime">Mais em conta</Tag> : null}
                {id === shortestId ? <Tag tone="lime">Menos dias</Tag> : null}
              </View>
              {rows.map((row) => {
                const v = row.values[i] ?? '';
                return (
                  <View key={row.label} style={s.row}>
                    <Text style={s.rowLabel}>{row.label}</Text>
                    <Text style={[s.rowValue, v.startsWith('Confirme') && s.warn]}>{v}</Text>
                  </View>
                );
              })}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${r.destination.name}`}
                onPress={() => onChoose(id)}
                style={({ pressed }) => [s.choose, on && s.chooseOn, pressed && { opacity: 0.85 }]}
              >
                <Text style={[s.chooseText, on && s.chooseTextOn]}>{on ? 'Escolhido' : 'Escolher este'}</Text>
              </Pressable>
            </ScrollView>
          );
        })}
      </ScrollView>
      <View style={s.footer}>
        <SecondaryTextButton title="Voltar aos destinos" onPress={onBack} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  head: { paddingHorizontal: 16, gap: 6, marginBottom: 12 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: '#0B0B0B' },
  subtitle: { fontFamily: fonts.medium, fontSize: 17, color: dc.teal },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: dc.lime, borderRadius: 16, padding: 12 },
  bannerText: { flex: 1, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, color: dc.dark },
  cards: { paddingHorizontal: 16, gap: 14, paddingBottom: 8 },
  card: { width: CARD_W, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: dc.border, ...cardShadow },
  cardOn: { borderColor: dc.dark, borderWidth: 2 },
  cardInner: { padding: 12, gap: 8 },
  photo: { width: '100%', height: 72, borderRadius: 16 },
  name: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 24, color: dc.dark },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderColor: dc.border },
  rowLabel: { width: 96, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: dc.muted },
  rowValue: { flex: 1, textAlign: 'right', fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, color: '#1A1A1A' },
  warn: { color: '#8A6100' },
  choose: { minHeight: 44, borderRadius: 14, borderWidth: 1.5, borderColor: dc.dark, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  chooseOn: { backgroundColor: dc.dark },
  chooseText: { fontFamily: fonts.semibold, fontSize: 16, color: dc.dark },
  chooseTextOn: { color: '#FFFFFF' },
  footer: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, width: '100%', maxWidth: 512, alignSelf: 'center' },
});
