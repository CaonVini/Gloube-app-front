import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { addPlace, joinNames, placesFor, togglePlace, type Place } from '../../domain/discover/places';
import { PrimaryButton } from '../auth-ui/Button';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { PlaceBackCard, PlaceCard, PlaceRow } from './PlaceCard';
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
  // Locais mostrados no resumo: os curtidos ao entrar nele. O check só alterna a escolha (a linha não some).
  const [shown, setShown] = useState<ReadonlySet<string>>(new Set());
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set());
  const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
  const likedIds = new Set(Object.values(selection).flat());
  const flip = (set: ReadonlySet<string>, id: string) => { const n = new Set(set); if (n.has(id)) n.delete(id); else n.add(id); return n; };

  const react = (it: Item, liked: boolean) => {
    if (!liked) return;
    onChange({ ...selection, [it.destinationId]: addPlace(selection[it.destinationId] ?? [], it.place.id) });
  };
  const toggle = (it: Item) => onChange({ ...selection, [it.destinationId]: togglePlace(selection[it.destinationId] ?? [], it.place.id) });
  const goSummary = () => { setShown(new Set(likedIds)); setPhase('summary'); };
  const addMore = () => { setRound((r) => r + 1); setPhase('deck'); };

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
          onFinish={goSummary}
          positionText={(i, n) => `${i + 1}/${n}`}
          likeLabel="Gostei, incluir no roteiro e ver o próximo"
          nopeLabel="Não gostei, próximo local"
          likeStamp="NO ROTEIRO"
          nopeStamp="PULAR"
        />
      </View>
    );
  }

  const total = likedIds.size;
  const groups = targets
    .map((tg) => ({ target: tg, rows: items.filter((i) => i.destinationId === tg.id && shown.has(i.place.id)) }))
    .filter((g) => g.rows.length > 0);
  const cities = joinNames(groups.map((g) => g.target.name));
  const PREVIEW = 4;

  return (
    <View style={s.root}>
      <View style={s.head}>
        <SegmentedProgress kicker="REVISE SUAS ESCOLHAS" current={1} total={2} />
        <StepTitle
          title="Sua viagem começa a ganhar forma."
          subtitle={total === 0 ? 'Nenhum lugar escolhido: sugerimos um roteiro geral.' : `${total} ${total === 1 ? 'lugar escolhido' : 'lugares escolhidos'} em ${cities || targets.map((x) => x.name).join(', ')}.`}
        />
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {groups.map(({ target, rows }) => {
          const isFolded = folded.has(target.id);
          const expanded = open.has(target.id);
          const visible = isFolded ? [] : expanded ? rows : rows.slice(0, PREVIEW);
          const count = rows.filter((r) => likedIds.has(r.place.id)).length;
          return (
            <View key={target.id} style={s.group}>
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: !isFolded }} accessibilityLabel={`${target.name}, ${count} lugares. ${isFolded ? 'Expandir' : 'Recolher'}`} onPress={() => setFolded(flip(folded, target.id))} style={s.groupHead}>
                <DIcon name="pin" size={22} color={dc.dark} />
                <Text style={s.groupName} accessibilityRole="header">{target.name}</Text>
                <Text style={s.groupCount}>{count} {count === 1 ? 'lugar' : 'lugares'}</Text>
                <View style={{ transform: [{ rotate: isFolded ? '90deg' : '-90deg' }] }}><DIcon name="chevronRight" size={16} color={dc.dark} /></View>
              </Pressable>
              {visible.map((it) => <PlaceRow key={it.place.id} place={it.place} checked={likedIds.has(it.place.id)} onToggle={() => toggle(it)} />)}
              {!isFolded ? (
                <View style={s.groupFoot}>
                  {rows.length > PREVIEW ? (
                    <Pressable accessibilityRole="button" onPress={() => setOpen(flip(open, target.id))} hitSlop={6} style={s.linkRow}>
                      <Text style={s.link}>{expanded ? 'Ver menos' : `Ver os ${rows.length} lugares`}</Text>
                      <View style={{ transform: [{ rotate: expanded ? '-90deg' : '90deg' }] }}><DIcon name="chevronRight" size={14} color={dc.teal} /></View>
                    </Pressable>
                  ) : <View />}
                  <Pressable accessibilityRole="button" onPress={addMore} hitSlop={6} style={s.linkRow}>
                    <Text style={s.link}>+ Adicionar lugares</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })}
        {groups.length === 0 && items.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={addMore} style={s.linkRow}><Text style={s.link}>+ Adicionar lugares</Text></Pressable>
        ) : null}
      </ScrollView>
      <View style={s.foot}>
        <View style={s.footRow}>
          <RoundButton icon="chevronLeft" label="Voltar" onPress={onBack} />
          <View style={s.flex}><PrimaryButton title="Montar meu roteiro" onPress={onContinue} size="hero" /></View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  flex: { flex: 1 },
  head: { paddingBottom: 8 },
  list: { paddingBottom: 8 },
  group: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: dc.border, paddingTop: 4, marginBottom: 8 },
  groupHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  groupName: { flex: 1, fontFamily: fonts.bold, fontSize: 22, letterSpacing: -0.4, color: '#0B0B0B' },
  groupCount: { fontFamily: fonts.regular, fontSize: 14, color: dc.muted },
  groupFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  link: { fontFamily: fonts.medium, fontSize: 15, color: dc.teal },
  foot: { paddingTop: 8, paddingBottom: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: dc.border },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
