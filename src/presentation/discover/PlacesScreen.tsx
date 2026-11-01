import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { KIND_LABEL, placesFor, togglePlace } from '../../domain/discover/places';
import { PrimaryButton } from '../auth-ui/Button';
import { fonts } from '../theme/auth-theme';
import { RoundButton, SegmentedProgress, SelectDot, StepTitle, dc } from './ui';

export interface PlaceTarget {
  id: string;
  name: string;
}

interface Props {
  targets: readonly PlaceTarget[];
  selection: Readonly<Record<string, readonly string[]>>;
  onChange: (next: Record<string, readonly string[]>) => void;
  onBack: () => void;
  onContinue: () => void;
}

const GAP = 10;

/** Escolha (opcional, múltipla) de locais de cada destino. Grade 2 colunas que preenche a altura, sem rolagem. */
export function PlacesScreen({ targets, selection, onChange, onBack, onContinue }: Props) {
  const [active, setActive] = useState(0);
  const [h, setH] = useState(0);
  const target = targets[Math.min(active, targets.length - 1)]!;
  const places = placesFor(target.id);
  const chosen = selection[target.id] ?? [];
  const total = targets.reduce((n, t) => n + (selection[t.id]?.length ?? 0), 0);
  const rows = Math.max(1, Math.ceil(places.length / 2));
  const rowH = h > 0 ? Math.max(84, Math.min(150, Math.floor((h - GAP * (rows - 1)) / rows))) : 96;
  const roomy = rowH >= 104;

  const toggle = (id: string) => onChange({ ...selection, [target.id]: togglePlace(chosen, id) });
  const onLayout = (e: LayoutChangeEvent) => setH(e.nativeEvent.layout.height);

  return (
    <View style={s.root}>
      <View style={s.head}>
        <SegmentedProgress kicker="ROTEIRO" current={1} total={2} />
        <StepTitle
          title={targets.length === 1 ? `O que você quer conhecer em ${target.name}?` : 'O que você quer conhecer?'}
          subtitle="Escolha quantos locais quiser. É opcional: dá para decidir depois."
        />
        {targets.length > 1 ? (
          <View style={s.tabs} accessibilityRole="tablist">
            {targets.map((t, i) => {
              const n = selection[t.id]?.length ?? 0;
              const on = i === active;
              return (
                <Pressable key={t.id} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => setActive(i)} style={[s.tab, on && s.tabOn]}>
                  <Text style={[s.tabText, on && s.tabTextOn]} numberOfLines={1}>{t.name}{n > 0 ? ` · ${n}` : ''}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <View style={s.grid} onLayout={onLayout}>
        {places.length === 0 ? (
          <Text style={s.empty}>Ainda não temos locais sugeridos para este destino. Você pode continuar mesmo assim.</Text>
        ) : (
          Array.from({ length: rows }, (_, r) => (
            <View key={r} style={[s.row, { height: rowH }]}>
              {[0, 1].map((c) => {
                const p = places[r * 2 + c];
                if (!p) return <View key={c} style={s.flex} />;
                const on = chosen.includes(p.id);
                return (
                  <Pressable key={p.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`${p.name}. ${p.blurb}`} onPress={() => toggle(p.id)} style={({ pressed }) => [s.card, on && s.cardOn, pressed && { opacity: 0.9 }]}>
                    <Text style={s.kind}>{KIND_LABEL[p.kind]}</Text>
                    <Text style={s.name} numberOfLines={2}>{p.name}</Text>
                    {roomy ? <Text style={s.blurb} numberOfLines={3}>{p.blurb}</Text> : null}
                    <View style={s.dot}><SelectDot on={on} variant="light" /></View>
                  </Pressable>
                );
              })}
            </View>
          ))
        )}
      </View>

      <View style={s.foot}>
        <Text style={s.meta} accessibilityLiveRegion="polite">
          {total === 0 ? 'Nenhum local escolhido: sugerimos um roteiro geral.' : `${total} ${total === 1 ? 'local escolhido' : 'locais escolhidos'}`}
        </Text>
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
  head: { paddingBottom: 10 },
  tabs: { flexDirection: 'row', gap: 8, paddingTop: 10 },
  tab: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', paddingVertical: 8, alignItems: 'center' },
  tabOn: { backgroundColor: dc.dark, borderColor: dc.dark },
  tabText: { fontFamily: fonts.semibold, fontSize: 13, color: dc.dark },
  tabTextOn: { color: '#FFFFFF' },
  grid: { flex: 1, gap: GAP, justifyContent: 'flex-start', overflow: 'hidden' },
  row: { flexDirection: 'row', gap: GAP },
  card: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center', gap: 3 },
  cardOn: { borderColor: dc.dark, borderWidth: 1.5, backgroundColor: '#EEF3EF' },
  kind: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.4, color: dc.muted, paddingRight: 28 },
  name: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 20, color: dc.dark },
  blurb: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: dc.muted },
  dot: { position: 'absolute', top: 10, right: 10 },
  empty: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: dc.muted, paddingTop: 12 },
  foot: { gap: 8, paddingTop: 8, paddingBottom: 8 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: dc.muted, minHeight: 20 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
