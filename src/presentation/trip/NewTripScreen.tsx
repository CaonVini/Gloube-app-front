import type React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import {
  SIMULATED_ORIGIN, addDestination, canAdvance, moveDestination, removeDestination,
  searchDestinations, type Destination,
} from '../../domain/trip-plan';
import { PrimaryButton } from '../auth-ui/Button';
import { AppHeader } from '../home/AppHeader';
import { BottomNavBar, DEFAULT_NAV_ITEMS, NAV_FAB_WIDTH } from '../navigation';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { TripIcon } from './TripIcon';

const MAX_COLUMN = 480;
const H_PADDING = 16;
const FIELD_BG = '#F3F1EC';
const BANNER_BG = '#E4EDE6';
const BADGE_BG = '#D3E4D8';
const INITIAL_DESTINATIONS: readonly Destination[] = [
  { id: 'paris', city: 'Paris', country: 'França' },
  { id: 'roma', city: 'Roma', country: 'Itália' },
];

interface Props {
  fullName: string;
  onSignOut: () => void;
  onNext?: () => void;
  onDiscover?: (origin: string) => void;
}

/** Passo 1 de 3 de "Nova viagem". Tudo local/fictício: origem simulada, busca em catálogo local, sem rede. */
export function NewTripScreen({ fullName, onSignOut, onNext, onDiscover }: Props) {
  const { width, height } = useWindowDimensions();
  const searchRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const originRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [origin, setOrigin] = useState('');
  const [query, setQuery] = useState('');
  const [destinations, setDestinations] = useState<readonly Destination[]>(INITIAL_DESTINATIONS);

  const suggestions = useMemo(() => searchDestinations(query, destinations), [query, destinations]);
  const ready = canAdvance(origin, destinations);

  // Tudo cabe em UMA tela (sem rolagem): medidas escalam com a altura (referência 844) e o título com a largura.
  const k = Math.min(1, Math.max(0.7, height / 900));
  const narrow = width < 380;
  const compact = height < 800; // telas baixas: esconde a nota e aperta o espaçamento
  const avail = Math.min(width, MAX_COLUMN + H_PADDING * 2) - H_PADDING * 2;
  const titleSize = Math.max(20, Math.min(28, Math.floor(avail / 14.8)));
  const m = useMemo(() => ({
    field: Math.round(38 * k), row: Math.round(44 * k), badge: Math.round(40 * k), h2: Math.round(19 * k), pad: Math.round(16 * k),
  }), [k]);

  const add = useCallback((d: Destination) => {
    setDestinations((list) => addDestination(list, d));
    setQuery('');
  }, []);
  const remove = useCallback((id: string) => setDestinations((list) => removeDestination(list, id)), []);
  // O ícone de menu sobe o item; o primeiro desce (sem biblioteca de gestos, acessível por toque).
  const shift = useCallback((index: number) => {
    setDestinations((list) => moveDestination(list, index, index === 0 ? 1 : index - 1));
  }, []);

  return (
    <View style={s.root}>
      <View style={s.content}>
        <View style={s.column}>
          <AppHeader fullName={fullName} onSignOut={onSignOut} />

          <View style={s.progressRow} accessible accessibilityLabel="Nova viagem, etapa 1 de 3">
            <Text style={s.kicker}>NOVA VIAGEM</Text>
            <View style={s.bars}>
              <View style={[s.bar, s.barOn]} /><View style={s.bar} /><View style={s.bar} />
            </View>
            <Text style={s.kicker}>1 de 3</Text>
          </View>

          <Text style={[s.title, { fontSize: titleSize, lineHeight: titleSize + 6 }]} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>Vamos desenhar sua viagem</Text>
          <Text style={s.subtitle}>Defina a origem e escolha seus destinos.</Text>
        </View>

        <View style={[s.column, s.flex]}>
          <View style={[s.card, { paddingHorizontal: m.pad, paddingVertical: m.pad, gap: compact ? 6 : 10 }]}>
            <Text style={[s.h2, { fontSize: m.h2, lineHeight: m.h2 + 5 }]} accessibilityRole="header">Onde estamos?</Text>
            {compact ? null : <Text style={s.hint}>De qual cidade você vai sair?</Text>}
            <View style={[s.field, { minHeight: m.field }]}>
              <TripIcon name="crosshair" size={20} color={authColors.text} />
              <TextInput
                ref={originRef}
                accessibilityLabel="Cidade de partida"
                placeholder="Informe sua cidade de partida"
                placeholderTextColor={authColors.placeholder}
                value={origin}
                onChangeText={setOrigin}
                maxLength={80}
                style={s.input}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Usar minha localização"
              onPress={() => setOrigin(SIMULATED_ORIGIN)}
              hitSlop={6}
              style={({ pressed }) => [s.linkRow, pressed && s.pressed]}
            >
              <TripIcon name="pin" size={18} color={authColors.link} />
              <Text style={s.link}>Usar minha localização</Text>
            </Pressable>

            <View style={s.divider} />

            <Text style={[s.h2, { fontSize: m.h2, lineHeight: m.h2 + 5 }]} accessibilityRole="header">Para onde vamos?</Text>
            <View style={{ zIndex: 5 }}>
              <View style={[s.field, { minHeight: m.field }]}>
                <TripIcon name="search" size={20} color={authColors.text} />
                <TextInput
                  ref={searchRef}
                  accessibilityLabel="Buscar cidade ou país"
                  placeholder="Busque uma cidade ou país"
                  placeholderTextColor={authColors.placeholder}
                  value={query}
                  onChangeText={setQuery}
                  maxLength={60}
                  style={s.input}
                />
              </View>
              {suggestions.length > 0 ? (
                <View style={s.suggestions}>
                  {suggestions.map((d) => (
                    <Pressable
                      key={d.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Adicionar ${d.city}, ${d.country}`}
                      onPress={() => add(d)}
                      style={({ pressed }) => [s.suggestion, pressed && s.pressed]}
                    >
                      <Text style={s.city}>{d.city}</Text>
                      <Text style={s.country}>{d.country}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            {/* Timeline: ocupa o espaço que sobra na tela (flex). Só rola se houver muitos destinos. */}
            <ScrollView
              style={s.list}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              nestedScrollEnabled
            >
              {destinations.map((d, i) => (
                <View key={d.id} style={s.item}>
                  <View style={[s.row, { minHeight: m.row }]}>
                    <View style={s.badgeCol}>
                      <View style={[s.badge, { width: m.badge, height: m.badge, borderRadius: m.badge / 2 }]}><Text style={[s.badgeText, { fontSize: 16 }]}>{i + 1}</Text></View>
                    </View>
                    <Pressable
                      accessibilityLabel={`${d.city}, ${d.country}. Toque e segure para remover.`}
                      onLongPress={() => remove(d.id)}
                      style={s.dest}
                    >
                      <View style={s.pinCircle}><TripIcon name="pin" size={16} color={authColors.text} /></View>
                      <View style={s.destText}>
                        <Text style={s.city} numberOfLines={1}>{d.city}</Text>
                        <Text style={s.country} numberOfLines={1}>{d.country}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={i === 0 ? `Mover ${d.city} para baixo` : `Mover ${d.city} para cima`}
                        disabled={destinations.length < 2}
                        onPress={() => shift(i)}
                        hitSlop={10}
                        style={({ pressed }) => [pressed && s.pressed, destinations.length < 2 && s.off]}
                      >
                        <TripIcon name="grip" size={24} color={authColors.placeholder} />
                      </Pressable>
                    </Pressable>
                  </View>
                  {i < destinations.length - 1 ? (
                    <View style={s.sep}><View style={s.sepLine} /></View>
                  ) : null}
                </View>
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Adicionar outro destino"
              onPress={() => searchRef.current?.focus()}
              style={({ pressed }) => [s.linkRow, pressed && s.pressed]}
            >
              <View style={s.plus}><TripIcon name="plus" size={16} color="#FFFFFF" /></View>
              <Text style={s.link}>Adicionar outro destino</Text>
            </Pressable>
            {compact || height < 960 ? null : <Text style={s.note}>Organize as paradas na ordem da sua viagem.</Text>}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ainda não sabe para onde ir? Descubra um destino com a sua cara."
            onPress={() => onDiscover?.(origin)}
            style={({ pressed }) => [s.banner, pressed && s.pressed]}
          >
            <View style={[s.bannerIcon, narrow && { width: 36, height: 36, borderRadius: 18 }]}><TripIcon name="compass" size={narrow ? 22 : 28} color={authColors.text} /></View>
            <View style={s.flex}>
              <Text style={[s.bannerTitle, narrow && { fontSize: 14, lineHeight: 18 }]} numberOfLines={1}>Ainda não sabe para onde ir?</Text>
              <Text style={[s.bannerText, narrow && { fontSize: 12 }]} numberOfLines={1}>Descubra um destino com a sua cara.</Text>
            </View>
            <TripIcon name="chevronRight" size={20} color={authColors.text} />
          </Pressable>

          {/* Rodapé dividido ao redor da bola central da navbar: nada de faixa vazia acima dela. */}
          <View style={s.footer}>
            <View style={s.footSide}>
              <View style={s.countSeal}><Text style={s.countSealText}>{destinations.length}</Text></View>
              <Text style={s.count} accessibilityLiveRegion="polite" numberOfLines={1}>{destinations.length === 1 ? 'destino' : 'destinos'}</Text>
            </View>
            <View style={{ width: NAV_FAB_WIDTH }} />
            <View style={s.footSide}>
              <View style={s.flex}><PrimaryButton title="Próximo" onPress={() => (ready ? onNext?.() : originRef.current?.focus())} size="half" /></View>
            </View>
          </View>
        </View>
      </View>
      {/* Navegação fictícia: "Descubra" fixo como aba ativa desta tela. */}
      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="discover" onChange={noop} />
    </View>
  );
}

function noop() {}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  flex: { flex: 1 },
  content: { flex: 1, paddingHorizontal: H_PADDING },
  column: { width: '100%', maxWidth: MAX_COLUMN, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  kicker: { fontFamily: fonts.regular, fontSize: 12, letterSpacing: 0.3, color: homeColors.subtitle },
  bars: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E1E3E0' },
  barOn: { backgroundColor: authColors.primary },
  title: { fontFamily: fonts.bold, letterSpacing: -0.6, color: '#0B0B0B', marginTop: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: '#3E7C86', marginTop: 0 },
  card: {
    flex: 1, marginTop: 10, backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#ECE9E3', gap: 6,
    shadowColor: '#1F3D36', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1,
  },
  h2: { fontFamily: fonts.bold, color: authColors.text },
  hint: { fontFamily: fonts.regular, fontSize: 13, color: homeColors.subtitle, marginTop: -6 },
  field: {
    flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, borderWidth: 1,
    borderColor: authColors.border, backgroundColor: FIELD_BG, paddingHorizontal: 14,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: authColors.body, paddingVertical: 6 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  link: { fontFamily: fonts.medium, fontSize: 14, color: authColors.link },
  divider: { height: 1, backgroundColor: authColors.border, marginVertical: 2 },
  suggestions: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, borderRadius: 14, borderWidth: 1, borderColor: authColors.border,
    overflow: 'hidden', backgroundColor: '#FFFFFF', zIndex: 10, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  suggestion: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: '#FFFFFF' },
  list: { flex: 1 },
  listContent: { flexGrow: 1, justifyContent: 'center' },
  item: { flexGrow: 1, flexShrink: 1, maxHeight: 72 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  badgeCol: { width: 44, alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: BADGE_BG, alignItems: 'center', justifyContent: 'center' },
  sep: { width: 44, height: 12, alignItems: 'center' },
  sepLine: { flex: 1, borderLeftWidth: 2, borderStyle: 'dotted', borderColor: authColors.link },
  badgeText: { fontFamily: fonts.bold, fontSize: 16, color: authColors.text },
  dest: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, backgroundColor: FIELD_BG, paddingHorizontal: 14 },
  destText: { flex: 1 },
  city: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 19, color: '#111' },
  country: { fontFamily: fonts.regular, fontSize: 13, color: authColors.link },
  plus: { width: 24, height: 24, borderRadius: 12, backgroundColor: authColors.link, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: fonts.regular, fontSize: 13, color: homeColors.subtitle },
  banner: {
    marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BANNER_BG, borderRadius: 18,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  bannerIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#D3E1D7', alignItems: 'center', justifyContent: 'center' },
  bannerTitle: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 19, color: '#111' },
  bannerText: { fontFamily: fonts.regular, fontSize: 13, color: homeColors.subtitle },
  footer: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 6 },
  footSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  countSeal: { minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 6, backgroundColor: '#F1EF71', alignItems: 'center', justifyContent: 'center' },
  countSealText: { fontFamily: fonts.bold, fontSize: 14, color: authColors.text },
  strip: { flexDirection: 'row', alignItems: 'center' },
  stripSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  stripGap: { width: 92 },
  count: { fontFamily: fonts.medium, fontSize: 14, color: homeColors.subtitle },
  stripHint: { fontFamily: fonts.regular, fontSize: 12, color: homeColors.subtitle },
  pinCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#D3E1D7', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
  off: { opacity: 0.4 },
});
