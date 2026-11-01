import { ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { buildComparison } from '../../domain/discover/compare';
import type { Recommendation } from '../../domain/discover/types';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { discoverColors } from './ui';

const LABEL_W = 120;
const COL_W = 150;

interface Props {
  favorites: readonly Recommendation[];
  chosenId: string | null;
  onChoose: (id: string) => void;
  onBack: () => void;
}

/** Comparação lado a lado dos favoritos; rolagem horizontal quando há muitas colunas. */
export function CompareScreen({ favorites, chosenId, onChoose, onBack }: Props) {
  const rows = buildComparison(favorites);
  const chosen = favorites.find((r) => r.destination.id === chosenId);
  return (
    <View style={s.root}>
      <Text style={s.title} accessibilityRole="header">Compare seus favoritos</Text>
      {chosen ? (
        <View style={s.banner} accessibilityLiveRegion="polite">
          <Text style={s.bannerText}>Você escolheu {chosen.destination.name}. Próximo passo: planejar a viagem com a Aurora (em breve).</Text>
        </View>
      ) : (
        <Text style={s.sub}>Escolha o destino que mais combina com você.</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.table}>
          <View style={s.row}>
            <View style={{ width: LABEL_W }} />
            {favorites.map((r) => (
              <View key={r.destination.id} style={[s.col, r.destination.id === chosenId && s.colChosen]}>
                <Image source={destinationImages[r.destination.id]} style={s.thumb} resizeMode="cover" />
                <Text style={s.name} numberOfLines={2}>{r.destination.name}</Text>
              </View>
            ))}
          </View>
          {rows.map((row) => (
            <View key={row.label} style={[s.row, s.line]}>
              <Text style={[s.label, { width: LABEL_W }]}>{row.label}</Text>
              {row.values.map((v, i) => (
                <Text key={favorites[i]!.destination.id} style={[s.cell, v.startsWith('Confirme') && s.cellWarn]}>{v}</Text>
              ))}
            </View>
          ))}
          <View style={s.row}>
            <View style={{ width: LABEL_W }} />
            {favorites.map((r) => (
              <Pressable
                key={r.destination.id}
                accessibilityRole="button"
                accessibilityLabel={`Escolher ${r.destination.name}`}
                onPress={() => onChoose(r.destination.id)}
                style={({ pressed }) => [s.choose, r.destination.id === chosenId && s.chooseOn, pressed && { opacity: 0.85 }]}
              >
                <Text style={[s.chooseText, r.destination.id === chosenId && s.chooseTextOn]}>{r.destination.id === chosenId ? 'Escolhido' : 'Escolher'}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      <View style={s.footer}>
        <SecondaryTextButton title="Voltar aos destinos" onPress={onBack} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingTop: 6 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: authColors.text, paddingHorizontal: 22 },
  sub: { fontFamily: fonts.regular, fontSize: 15, color: homeColors.subtitle, paddingHorizontal: 22, marginTop: 4, marginBottom: 12 },
  banner: { marginHorizontal: 22, marginTop: 8, marginBottom: 12, backgroundColor: discoverColors.selectedBg, borderRadius: 12, padding: 12 },
  bannerText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: authColors.primary },
  table: { paddingHorizontal: 22, paddingBottom: 12, gap: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  line: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#E7E4DD' },
  col: { width: COL_W, paddingHorizontal: 6, gap: 6, borderRadius: 14, paddingBottom: 6 },
  colChosen: { backgroundColor: discoverColors.selectedBg },
  thumb: { width: COL_W - 12, height: 80, borderRadius: 10 },
  name: { fontFamily: fonts.bold, fontSize: 15, color: authColors.text },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: homeColors.subtitle },
  cell: { width: COL_W, paddingHorizontal: 6, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: authColors.body },
  cellWarn: { color: '#8A6100' },
  choose: { width: COL_W - 12, marginHorizontal: 6, minHeight: 42, borderRadius: 9, borderWidth: 1.5, borderColor: authColors.primary, alignItems: 'center', justifyContent: 'center' },
  chooseOn: { backgroundColor: authColors.primary },
  chooseText: { fontFamily: fonts.semibold, fontSize: 15, color: authColors.primary },
  chooseTextOn: { color: authColors.primaryText },
  footer: { paddingHorizontal: 22, paddingTop: 8 },
});
