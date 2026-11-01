import { memo, useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { formatBRL } from '../../domain/discover/budget';
import { firstSentence } from '../../domain/discover/choice';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { RoundButton, cardShadow, dc } from './ui';

interface Props {
  /** Todas as sugestões, já com os favoritos no início. */
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onBack: () => void;
  onAdjust: () => void;
  /** Escolha definitiva (só depois da confirmação explícita). */
  onConfirm: (rec: Recommendation) => void;
}

const SHADE = Array.from({ length: 16 }, (_, i) => `rgba(8,24,20,${(0.75 * Math.pow((i + 1) / 16, 1.9)).toFixed(3)})`);

/** Card grande com foto: seleção única com animação suave (leve escala + pop do check). */
const Option = memo(function Option({ rec, favorite, selected, onSelect, photoH }: { rec: Recommendation; favorite: boolean; selected: boolean; onSelect: (id: string) => void; photoH: number }) {
  const d = rec.destination;
  const scale = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: selected ? 1.015 : 1, useNativeDriver: false, friction: 6, tension: 120 }),
      Animated.spring(pop, { toValue: selected ? 1 : 0, useNativeDriver: false, friction: 5, tension: 160 }),
    ]).start();
  }, [selected, scale, pop]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${d.name}, ${d.country}.${favorite ? ' Favorito.' : ''} Estimativa de ${formatBRL(rec.estimatedCost)} por pessoa.`}
        onPress={() => onSelect(d.id)}
        style={({ pressed }) => [s.option, cardShadow, selected && s.optionOn, pressed && { opacity: 0.94 }]}
      >
        <View style={{ height: photoH, backgroundColor: dc.dark }}>
          <Image source={destinationImages[d.id]} style={s.photo} resizeMode="cover" />
          <View pointerEvents="none" style={s.shade}>{SHADE.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}</View>
          {favorite ? <View style={s.favTag}><DIcon name="heart" size={13} color={dc.dark} /><Text style={s.favText}>Favorito</Text></View> : null}
          <Animated.View style={[s.check, { transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }], opacity: pop }]}>
            <DIcon name="check" size={18} color="#FFFFFF" />
          </Animated.View>
          {selected ? null : <View style={s.ring} />}
          <View pointerEvents="none" style={s.overText}>
            <Text style={s.name} numberOfLines={1}>{d.name}</Text>
            <Text style={s.country} numberOfLines={1}>{d.country}</Text>
          </View>
        </View>
        <View style={s.info}>
          <Text style={s.reason} numberOfLines={2}>{firstSentence(rec.why)}</Text>
          <View style={s.chips}>
            <View style={s.chip}><Text style={s.chipText}>~{formatBRL(rec.estimatedCost)} por pessoa (estimativa)</Text></View>
            <View style={s.chip}><Text style={s.chipText}>Mín. {d.minDays} dias</Text></View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

/** Tela final: todas as sugestões, seleção única (nenhuma vem marcada) e confirmação explícita antes de seguir. */
export function ChooseScreen({ recs, favorites, onBack, onAdjust, onConfirm }: Props) {
  const { width, height } = useWindowDimensions();
  const photoH = height < 800 ? 150 : 190;
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
          <Option key={r.destination.id} rec={r} favorite={favorites.has(r.destination.id)} selected={r.destination.id === selectedId} onSelect={setSelectedId} photoH={photoH} />
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
  list: { gap: 14, paddingBottom: 8, paddingTop: 8, paddingHorizontal: 4 },
  option: { borderRadius: 24, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  optionOn: { borderColor: dc.dark },
  photo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  overText: { position: 'absolute', left: 16, right: 60, bottom: 12 },
  name: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: '#FFFFFF' },
  country: { fontFamily: fonts.semibold, fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  favTag: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  favText: { fontFamily: fonts.semibold, fontSize: 12, color: dc.dark },
  check: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: dc.dark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  ring: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  info: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  reason: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: '#2B2F2E' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: '#F1F3F0', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontFamily: fonts.medium, fontSize: 12, color: dc.dark },
  footer: { gap: 6, paddingTop: 8, paddingBottom: 8 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted, textAlign: 'center' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,20,17,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 10 },
  dialogTitle: { fontFamily: fonts.bold, fontSize: 22, color: dc.dark },
  dialogText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#2B2F2E', marginBottom: 6 },
});
