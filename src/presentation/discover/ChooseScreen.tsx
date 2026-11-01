import { memo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import { firstSentence } from '../../domain/discover/choice';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { RoundButton, SelectDot, cardShadow, dc } from './ui';

interface Props {
  /** Todas as sugestões, já com os favoritos no início. */
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onBack: () => void;
  onAdjust: () => void;
  /** Escolha definitiva (só depois da confirmação explícita). */
  onConfirm: (rec: Recommendation) => void;
}

const Option = memo(function Option({ rec, favorite, selected, onSelect }: { rec: Recommendation; favorite: boolean; selected: boolean; onSelect: (id: string) => void }) {
  const d = rec.destination;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${d.name}, ${d.country}.${favorite ? ' Favorito.' : ''} Estimativa de ${formatBRL(rec.estimatedCost)} por pessoa.`}
      onPress={() => onSelect(d.id)}
      style={({ pressed }) => [s.option, cardShadow, selected && s.optionOn, pressed && { opacity: 0.92 }]}
    >
      <Image source={destinationImages[d.id]} style={s.thumb} resizeMode="cover" />
      <View style={s.optionText}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={1}>{d.name}</Text>
          {favorite ? <DIcon name="heart" size={14} color={dc.dark} /> : null}
        </View>
        <Text style={s.country} numberOfLines={1}>{d.country}</Text>
        <Text style={s.reason} numberOfLines={2}>{firstSentence(rec.why)}</Text>
        <Text style={s.cost}>~{formatBRL(rec.estimatedCost)} <Text style={s.costNote}>por pessoa (estimativa)</Text></Text>
      </View>
      <SelectDot on={selected} variant="light" />
    </Pressable>
  );
});

/** Tela final: todas as sugestões, seleção única (nenhuma vem marcada) e confirmação explícita antes de seguir. */
export function ChooseScreen({ recs, favorites, onBack, onAdjust, onConfirm }: Props) {
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const selected = recs.find((r) => r.destination.id === selectedId) ?? null;
  return (
    <View style={s.root}>
      <View style={s.head}>
        <Text style={s.title} accessibilityRole="header">Qual será o seu próximo destino?</Text>
        <Text style={s.subtitle}>Compare as sugestões e escolha onde sua viagem vai acontecer.</Text>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.list} showsVerticalScrollIndicator={false} accessibilityRole="radiogroup">
        {recs.map((r) => (
          <Option key={r.destination.id} rec={r} favorite={favorites.has(r.destination.id)} selected={r.destination.id === selectedId} onSelect={setSelectedId} />
        ))}
        <SecondaryTextButton title="Ajustar minhas preferências" onPress={onAdjust} />
      </ScrollView>
      <View style={s.footer}>
        <Text style={s.hint} accessibilityLiveRegion="polite">{selected ? `Selecionado: ${selected.destination.name}` : 'Selecione um destino para continuar.'}</Text>
        <View style={s.footRow}>
          <RoundButton icon="chevronLeft" label="Voltar à exploração" onPress={onBack} />
          <View style={s.flex}><PrimaryButton title="Escolher este destino" onPress={() => setConfirming(true)} disabled={!selected} size={width < 380 ? 'half' : 'hero'} /></View>
        </View>
      </View>

      <Modal transparent visible={confirming && !!selected} animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View style={s.backdrop}>
          <View style={s.dialog} accessibilityViewIsModal>
            <Text style={s.dialogTitle} accessibilityRole="header">Confirmar {selected?.destination.name}?</Text>
            <Text style={s.dialogText}>Vamos usar este destino e as suas respostas para montar a prévia do roteiro. Você ainda poderá voltar e mudar.</Text>
            <PrimaryButton title="Confirmar destino" onPress={() => { setConfirming(false); if (selected) onConfirm(selected); }} size="hero" />
            <SecondaryTextButton title="Voltar" onPress={() => setConfirming(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  flex: { flex: 1 },
  head: { gap: 4, paddingBottom: 10 },
  title: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: '#0B0B0B' },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: '#3E7C86' },
  list: { gap: 10, paddingBottom: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 20, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF' },
  optionOn: { borderColor: dc.dark, borderWidth: 2, backgroundColor: '#F4F8F5' },
  thumb: { width: 72, height: 88, borderRadius: 14, backgroundColor: dc.mint },
  optionText: { flex: 1, gap: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontFamily: fonts.bold, fontSize: 17, color: dc.dark, flexShrink: 1 },
  country: { fontFamily: fonts.medium, fontSize: 13, color: dc.teal },
  reason: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: '#2B2F2E', marginTop: 2 },
  cost: { fontFamily: fonts.bold, fontSize: 14, color: dc.dark, marginTop: 2 },
  costNote: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted },
  footer: { gap: 6, paddingTop: 8, paddingBottom: 8 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted, textAlign: 'center' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,20,17,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 10 },
  dialogTitle: { fontFamily: fonts.bold, fontSize: 22, color: dc.dark },
  dialogText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#2B2F2E', marginBottom: 6 },
});
