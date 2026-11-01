import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { addPlace, placesFor, type Place } from '../../domain/discover/places';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { PlaceBackCard, PlaceCard, PlaceTile } from './PlaceCard';
import { SwipeDeck } from './SwipeDeck';
import { RoundButton, SegmentedProgress, StepTitle, dc } from './ui';

export interface PlaceTarget {
  id: string;
  name: string;
}

interface Props {
  targets: readonly PlaceTarget[];
  /** Locais curtidos por destino (viram o roteiro). */
  selection: Readonly<Record<string, readonly string[]>>;
  onChange: (next: Record<string, readonly string[]>) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface Item {
  place: Place;
  destinationId: string;
  destinationName: string;
}

/**
 * Escolha de locais em pilha estilo Tinder (✕ não gostei / ♥ gostei): os curtidos viram o roteiro.
 * Ao fim, um resumo permite remover locais antes de ver o roteiro. Tudo opcional.
 */
export function PlacesScreen({ targets, selection, onChange, onBack, onContinue }: Props) {
  const items = useMemo<Item[]>(() => targets.flatMap((t) => placesFor(t.id).map((place) => ({ place, destinationId: t.id, destinationName: t.name }))), [targets]);
  const [phase, setPhase] = useState<'deck' | 'summary'>(items.length === 0 ? 'summary' : 'deck');
  const [round, setRound] = useState(0);
  const multi = targets.length > 1;
  const { height: winH } = useWindowDimensions();
  const tileH = winH < 800 ? 132 : 164;
  const likedIds = new Set(Object.values(selection).flat());
  const total = likedIds.size;

  const react = (it: Item, liked: boolean) => {
    if (!liked) return;
    onChange({ ...selection, [it.destinationId]: addPlace(selection[it.destinationId] ?? [], it.place.id) });
  };
  const remove = (it: Item) => onChange({ ...selection, [it.destinationId]: (selection[it.destinationId] ?? []).filter((id) => id !== it.place.id) });
  const liked = items.filter((i) => likedIds.has(i.place.id));

  if (phase === 'deck') {
    return (
      <View style={s.root}>
        <View style={s.head}>
          <SegmentedProgress kicker="ROTEIRO" current={1} total={2} />
          <StepTitle
            title={multi ? 'O que você quer conhecer?' : `O que você quer conhecer em ${targets[0]?.name}?`}
            subtitle="Curta os locais que entram no seu roteiro. Opcional."
          />
        </View>
        <SwipeDeck
          key={round}
          items={items}
          keyOf={(i) => i.place.id}
          renderFront={(i, w, h) => <PlaceCard place={i.place} destinationId={i.destinationId} destinationName={multi ? i.destinationName : undefined} width={w} height={h} />}
          renderBack={(i, w, h) => <PlaceBackCard place={i.place} destinationId={i.destinationId} width={w} height={h} />}
          onReact={react}
          onFinish={() => setPhase('summary')}
          positionText={(i, n) => `${i + 1} de ${n} locais${total > 0 ? `  ·  ${total} no roteiro` : ''}`}
          likeLabel="Gostei, incluir no roteiro e ver o próximo"
          nopeLabel="Não gostei, próximo local"
          likeStamp="NO ROTEIRO"
          nopeStamp="PULAR"
          headerRight={<Text style={s.skip} accessibilityRole="button" accessibilityLabel="Pular a escolha de locais" onPress={() => setPhase('summary')}>Pular</Text>}
        />
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.head}>
        <SegmentedProgress kicker="ROTEIRO" current={1} total={2} />
        <StepTitle
          title="Seus locais"
          subtitle={total === 0 ? 'Nenhum local escolhido: sugerimos um roteiro geral.' : `${total} ${total === 1 ? 'local entra' : 'locais entram'} no seu roteiro.`}
        />
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {Array.from({ length: Math.ceil(liked.length / 2) }, (_, r) => (
          <View key={r} style={s.gridRow}>
            {[0, 1].map((c) => {
              const it = liked[r * 2 + c];
              if (!it) return <View key={c} style={s.flex} />;
              return <PlaceTile key={it.place.id} place={it.place} destinationId={it.destinationId} destinationName={multi ? it.destinationName : undefined} height={tileH} onRemove={() => remove(it)} />;
            })}
          </View>
        ))}
        {items.length > 0 ? <SecondaryTextButton title={total === 0 ? 'Ver os locais' : 'Ver os locais de novo'} onPress={() => { setRound((r) => r + 1); setPhase('deck'); }} /> : null}
      </ScrollView>
      <View style={s.foot}>
        <View style={s.footRow}>
          <RoundButton icon="chevronLeft" label="Voltar" onPress={onBack} />
          <View style={s.flex}><PrimaryButton title="Ver roteiro" onPress={onContinue} size="hero" /></View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  flex: { flex: 1 },
  head: { paddingBottom: 8 },
  skip: { fontFamily: fonts.bold, fontSize: 14, color: dc.teal, paddingVertical: 2, paddingHorizontal: 4 },
  list: { gap: 12, paddingBottom: 8 },
  gridRow: { flexDirection: 'row', gap: 12 },
  foot: { paddingTop: 8, paddingBottom: 8 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
