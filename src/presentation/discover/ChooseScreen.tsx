import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { firstSentence } from '../../domain/discover/choice';
import { likedByMatch, type MatchResult } from '../../domain/discover/match';
import type { Answers, Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { RoundButton, cardShadow, dc } from './ui';

interface Props {
  /** Todas as sugestões (a tela mostra só as curtidas). */
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  answers: Answers;
  onBack: () => void;
  onAdjust: () => void;
  /** Escolha definitiva (só depois da confirmação explícita). */
  onConfirm: (rec: Recommendation) => void;
}

const SHADE = Array.from({ length: 16 }, (_, i) => `rgba(8,24,20,${(0.75 * Math.pow((i + 1) / 16, 1.9)).toFixed(3)})`);

/** Card grande com foto: seleção única com animação suave (leve escala + pop do check) e % de match. */
const Option = memo(function Option({ rec, match, selected, onSelect, photoH }: { rec: Recommendation; match: MatchResult; selected: boolean; onSelect: (id: string) => void; photoH: number }) {
  const d = rec.destination;
  const scale = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: selected ? 1.015 : 1, useNativeDriver: false, friction: 6, tension: 120 }),
      Animated.spring(pop, { toValue: selected ? 1 : 0, useNativeDriver: false, friction: 5, tension: 160 }),
    ]).start();
  }, [selected, scale, pop]);
  const matched = match.criteria.filter((c) => c.earned >= c.max * 0.99).map((c) => c.label);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`${d.name}, ${d.country}. ${match.percent}% de match com as suas respostas.`}
        onPress={() => onSelect(d.id)}
        style={({ pressed }) => [s.option, cardShadow, selected && s.optionOn, pressed && { opacity: 0.94 }]}
      >
        <View style={{ height: photoH, backgroundColor: dc.dark }}>
          <Image source={destinationImages[d.id]} style={s.photo} resizeMode="cover" />
          <View pointerEvents="none" style={s.shade}>{SHADE.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}</View>
          <View style={s.matchPill}><Text style={s.matchText}>{match.percent}% match</Text></View>
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
          {matched.length > 0 ? <Text style={s.matched} numberOfLines={1}>Combina em: {matched.join(' · ').toLowerCase()}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
});

/** Tela final: só os destinos curtidos, do maior match ao menor; seleção única (nada pré-marcado) e confirmação explícita. */
export function ChooseScreen({ recs, favorites, answers, onBack, onAdjust, onConfirm }: Props) {
  const { width, height } = useWindowDimensions();
  const photoH = height < 800 ? 140 : 180;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const items = useMemo(() => likedByMatch(recs, favorites, answers), [recs, favorites, answers]);
  const selected = items.find((x) => x.rec.destination.id === selectedId)?.rec ?? null;

  if (items.length === 0) {
    return (
      <View style={s.root}>
        <View style={s.empty}>
          <Text style={s.title} accessibilityRole="header">Você ainda não curtiu nenhum destino</Text>
          <Text style={s.subtitle}>Volte à exploração e toque no ♥ nos destinos que combinam com você. Eles aparecem aqui com o match de cada um.</Text>
          <PrimaryButton title="Voltar à exploração" onPress={onBack} size="hero" />
          <SecondaryTextButton title="Ajustar minhas preferências" onPress={onAdjust} />
        </View>
      </View>
    );
  }
  return (
    <View style={s.root}>
      <View style={s.head}>
        <Text style={s.title} accessibilityRole="header">Qual será o seu próximo destino?</Text>
        <Text style={s.subtitle}>Seus curtidos, do maior match ao menor, com base nas suas respostas.</Text>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.list} showsVerticalScrollIndicator={false} accessibilityRole="radiogroup">
        {items.map(({ rec, match }) => (
          <Option key={rec.destination.id} rec={rec} match={match} selected={rec.destination.id === selectedId} onSelect={setSelectedId} photoH={photoH} />
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
  matchPill: { position: 'absolute', left: 12, top: 12, backgroundColor: dc.lime, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 5 },
  matchText: { fontFamily: fonts.bold, fontSize: 12, color: dc.dark },
  check: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: dc.dark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  ring: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  info: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  reason: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 21, color: '#1F2A27' },
  matched: { fontFamily: fonts.medium, fontSize: 12, color: dc.teal },
  empty: { flex: 1, justifyContent: 'center', gap: 14 },
  footer: { gap: 6, paddingTop: 8, paddingBottom: 8 },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted, textAlign: 'center' },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(11,20,17,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 400, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 10 },
  dialogTitle: { fontFamily: fonts.bold, fontSize: 22, color: dc.dark },
  dialogText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: '#2B2F2E', marginBottom: 6 },
});
