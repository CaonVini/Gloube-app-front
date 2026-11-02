import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import type { TripPreview } from '../../domain/discover/choice';
import { PrimaryButton } from '../auth-ui/Button';
import { fonts } from '../theme/auth-theme';
import { destinationImages } from './assets';
import { DIcon } from './icons';
import { cardShadow, dc } from './ui';

interface Props {
  /** Uma prévia por destino (várias quando o atalho trouxe mais de uma cidade). */
  previews: readonly TripPreview[];
  onEditPlaces: () => void;
  /** Só no fluxo Descubra: voltar a escolher outro destino. */
  onBackToChoice?: () => void;
  onDone: () => void;
}

/** Cadeado desenhado com Views (sem SVG nem imagem). */
function Lock({ size = 14, color = dc.dark }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size * 1.15, alignItems: 'center' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ width: size * 0.62, height: size * 0.55, borderWidth: size * 0.14, borderColor: color, borderBottomWidth: 0, borderTopLeftRadius: size, borderTopRightRadius: size }} />
      <View style={{ width: size, height: size * 0.62, borderRadius: size * 0.16, backgroundColor: color, marginTop: -1 }} />
    </View>
  );
}

const PIN_POS = [{ x: 0.42, y: 0.2 }, { x: 0.22, y: 0.45 }, { x: 0.62, y: 0.55 }] as const;
const BLUR = Platform.select({ web: { filter: 'blur(2.5px)' }, default: {} }) as object;

/** Mapa ilustrado (blocos, rio, ruas) borrado, com pinos numerados dos locais escolhidos. Sem mapa real e sem SVG. */
function PreviewMap({ pins }: { pins: readonly string[] }) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  const pts = pins.slice(0, 3).map((_, i) => ({ x: PIN_POS[i]!.x * box.w, y: PIN_POS[i]!.y * box.h }));
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    for (let k = 1; k <= 5; k++) dots.push({ x: pts[i]!.x + ((pts[i + 1]!.x - pts[i]!.x) * k) / 6, y: pts[i]!.y + ((pts[i + 1]!.y - pts[i]!.y) * k) / 6 });
  }
  return (
    <View style={s.map} onLayout={onLayout} accessibilityLabel="Prévia ilustrativa do mapa, bloqueada" accessibilityRole="image">
      <View style={[StyleSheet.absoluteFill, BLUR]} pointerEvents="none">
        <View style={[s.block, { left: '4%', top: '10%', width: '26%', height: '24%', backgroundColor: '#CFE0C4' }]} />
        <View style={[s.block, { left: '8%', top: '56%', width: '30%', height: '26%', backgroundColor: '#D6E4CB' }]} />
        <View style={[s.block, { left: '40%', top: '70%', width: '24%', height: '20%', backgroundColor: '#CFE0C4' }]} />
        <View style={[s.block, { left: '30%', top: '6%', width: '22%', height: '16%', backgroundColor: '#E1E5DC' }]} />
        <View style={[s.river, { left: '66%' }]} />
        <View style={[s.road, { left: '0%', top: '38%', width: '100%', height: 5 }]} />
        <View style={[s.road, { left: '34%', top: '0%', width: 5, height: '100%' }]} />
        <View style={[s.road, { left: '14%', top: '0%', width: 3, height: '100%', transform: [{ rotate: '12deg' }] }]} />
        <View style={[s.road, { left: '0%', top: '66%', width: '100%', height: 3, transform: [{ rotate: '-6deg' }] }]} />
      </View>
      {box.w > 0 ? dots.map((d, i) => <View key={`d${i}`} style={[s.dot, { left: d.x - 2, top: d.y - 2 }]} />) : null}
      {box.w > 0 ? pts.map((p, i) => (
        <View key={`p${i}`} style={[s.pin, { left: p.x - 13, top: p.y - 13 }]}><Text style={s.pinText}>{i + 1}</Text></View>
      )) : null}
      <View style={s.mapLock}><Lock size={12} /><Text style={s.mapLockText}>Prévia do mapa</Text></View>
    </View>
  );
}

/** Prévia "Sua viagem já tem forma.": dados reais do fluxo; mapa, dias 2+ e preço são ilustrativos/bloqueados (demonstração). */
export function ItineraryScreen({ previews, onEditPlaces, onBackToChoice, onDone }: Props) {
  const { width } = useWindowDimensions();
  const narrow = width < 380;
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [unlockMsg, setUnlockMsg] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <View style={s.loading} accessibilityLiveRegion="polite">
        <ActivityIndicator color={dc.dark} />
        <Text style={s.loadingText}>Montando a prévia do seu roteiro…</Text>
      </View>
    );
  }
  const p = previews[Math.min(active, previews.length - 1)]!;
  const img = destinationImages[p.id];
  return (
    <ScrollView style={s.flex} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar para os locais" onPress={onEditPlaces} hitSlop={8} style={s.back}>
        <DIcon name="chevronLeft" size={16} color={dc.teal} /><Text style={s.backText}>Voltar</Text>
      </Pressable>
      <View>
        <Text style={[s.title, narrow && { fontSize: 24, lineHeight: 29 }]} accessibilityRole="header">{p.title}</Text>
        <Text style={s.subtitle}>{p.subtitle}</Text>
      </View>

      {previews.length > 1 ? (
        <View style={s.tabs} accessibilityRole="tablist">
          {previews.map((x, i) => (
            <Pressable key={x.id} accessibilityRole="tab" accessibilityState={{ selected: i === active }} onPress={() => setActive(i)} style={[s.tab, i === active && s.tabOn]}>
              <Text style={[s.tabText, i === active && { color: '#FFFFFF' }]} numberOfLines={1}>{x.destination}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={[s.hero, cardShadow]}>
        {img ? <Image source={img} style={s.heroImg} resizeMode="cover" accessibilityLabel={`Imagem de ${p.destination}`} /> : (
          <View style={s.heroFallback}><DIcon name="world" size={96} color="rgba(255,255,255,0.14)" /></View>
        )}
        <View pointerEvents="none" style={s.heroShade}>
          {Array.from({ length: 16 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: `rgba(8,24,20,${(0.72 * Math.pow((i + 1) / 16, 1.8)).toFixed(3)})` }} />)}
        </View>
        <View style={s.pill}><DIcon name="sparkle" size={13} color={dc.dark} /><Text style={s.pillText}>ESCOLHIDO POR VOCÊ</Text></View>
        <View pointerEvents="none" style={s.heroText}>
          <Text style={s.heroName} numberOfLines={1}>{p.destination}, {p.country}</Text>
          <Text style={s.heroMeta} numberOfLines={1}>{p.dateLabel}{p.travelersLabel ? `  ·  ${p.travelersLabel}` : ''}</Text>
        </View>
      </View>

      <View style={s.chips}>
        {p.chips.map((c, i) => (
          <View key={c} style={s.chip}>
            {i === 0 ? <DIcon name="calendar" size={16} color={dc.dark} /> : null}
            <Text style={s.chipText} numberOfLines={1}>{c}</Text>
          </View>
        ))}
      </View>

      <View style={s.sectionHead}>
        <Text style={s.section} accessibilityRole="header">Uma prévia da sua viagem</Text>
        <View style={s.badge}><Text style={s.badgeText}>PRÉVIA</Text></View>
      </View>

      <View style={s.panel}>
        <View style={s.panelCol}>
          <View style={s.panelHead}><DIcon name="world" size={18} color={dc.dark} /><Text style={s.panelTitle}>Mapa</Text></View>
          <PreviewMap pins={p.pins} />
        </View>
        <View style={s.panelDivider} />
        <View style={[s.panelCol, { paddingRight: 12 }]}>
          <View style={s.panelHead}><DIcon name="calendarMonth" size={18} color={dc.dark} /><Text style={s.panelTitle}>Seu roteiro</Text></View>
          <Text style={s.dayTitle}>Dia 1</Text>
          {p.dayOne.map((d, i) => (
            <View key={d.time} style={s.slot}>
              <Text style={s.time}>{d.time}</Text>
              <View style={s.railWrap}><View style={s.railDot} />{i < p.dayOne.length - 1 ? <View style={s.rail} /> : null}</View>
              <Text style={s.slotLabel} numberOfLines={2}>{d.label}</Text>
            </View>
          ))}
          <Text style={s.slotNote}>Horários sugeridos.</Text>
          {p.lockedLabel ? (
            <View style={s.locked}><Lock size={13} /><Text style={s.lockedText}>{p.lockedLabel}</Text></View>
          ) : null}
        </View>
      </View>

      <View style={s.unlockRow}><Lock size={14} color={dc.muted} /><Text style={s.unlockText}>Desbloqueie todos os dias e o mapa completo.</Text></View>

      <View style={[s.price, cardShadow]}>
        <View style={s.priceTop}>
          <View style={s.flex}>
            <Text style={s.priceTitle}>Seu roteiro completo + Aurora</Text>
            <Text style={s.priceSub}>Todos os dias, mapa e ajustes pelo chat.</Text>
            <Text style={s.priceValue}>R$ XX <Text style={s.priceNote}>· pagamento único</Text></Text>
          </View>
          <View style={s.auroraBadge}><DIcon name="sparkle" size={24} color={dc.dark} /></View>
        </View>
        <PrimaryButton title="Desbloquear minha viagem" onPress={() => setUnlockMsg(true)} leftIcon={<DIcon name="sparkle" size={18} color="#FFFFFF" />} />
        <Text style={s.priceFoot}>Passagens, hospedagem e ingressos à parte.</Text>
        {unlockMsg ? <Text style={s.demo} accessibilityLiveRegion="polite">Demonstração: o desbloqueio e o valor ainda não estão disponíveis nesta versão.</Text> : null}
      </View>

      {p.notes.map((n) => <Text key={n} style={s.note}>{n}</Text>)}
      <View style={s.links}>
        <SoftLink title="Editar locais" onPress={onEditPlaces} />
        {onBackToChoice ? <SoftLink title="Escolher outro destino" onPress={onBackToChoice} /> : null}
        <SoftLink title="Voltar ao início" onPress={onDone} />
      </View>
    </ScrollView>
  );
}

/** Ação secundária discreta: link de texto pequeno, alvo de toque ≥ 44px. */
function SoftLink({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={title} onPress={onPress} style={s.linkHit}>
      <Text style={s.linkText}>{title}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  links: { alignItems: 'center', marginTop: 4, marginBottom: 8 },
  linkHit: { minHeight: 44, minWidth: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: fonts.medium, fontSize: 14, color: '#6F827B' },
  content: { width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32 },
  loadingText: { fontFamily: fonts.medium, fontSize: 16, color: dc.dark, textAlign: 'center' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  backText: { fontFamily: fonts.medium, fontSize: 15, color: dc.teal },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 33, letterSpacing: -0.7, color: '#0B0B0B' },
  subtitle: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 23, color: '#6B8A92', marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', paddingVertical: 8, alignItems: 'center' },
  tabOn: { backgroundColor: dc.dark, borderColor: dc.dark },
  tabText: { fontFamily: fonts.semibold, fontSize: 13, color: dc.dark },
  hero: { height: 168, borderRadius: 24, overflow: 'hidden', backgroundColor: dc.dark },
  heroImg: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  heroFallback: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  heroShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '65%' },
  pill: { position: 'absolute', left: 12, top: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: dc.lime, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.8, color: dc.dark },
  heroText: { position: 'absolute', left: 16, right: 16, bottom: 12, gap: 1 },
  heroName: { fontFamily: fonts.bold, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: '#FFFFFF' },
  heroMeta: { fontFamily: fonts.semibold, fontSize: 14, color: 'rgba(255,255,255,0.92)' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 16, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 6 },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: dc.dark, flexShrink: 1 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  section: { fontFamily: fonts.bold, fontSize: 20, letterSpacing: -0.3, color: '#0B0B0B', flexShrink: 1 },
  badge: { backgroundColor: '#DCEBEC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.2, color: dc.teal },
  panel: { flexDirection: 'row', borderRadius: 22, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  panelCol: { flex: 1, paddingLeft: 12, paddingTop: 12, paddingBottom: 12, gap: 6 },
  panelDivider: { width: 1, backgroundColor: dc.border, marginLeft: 12 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelTitle: { fontFamily: fonts.semibold, fontSize: 15, color: dc.dark },
  map: { flex: 1, minHeight: 170, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E8EEE2', marginRight: 12 },
  block: { position: 'absolute', borderRadius: 10 },
  river: { position: 'absolute', top: '-10%', width: '16%', height: '130%', backgroundColor: '#BBD7E4', transform: [{ rotate: '14deg' }] },
  road: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.95)' },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: dc.teal },
  pin: { position: 'absolute', width: 26, height: 26, borderRadius: 13, backgroundColor: dc.lime, borderWidth: 2, borderColor: dc.dark, alignItems: 'center', justifyContent: 'center' },
  pinText: { fontFamily: fonts.bold, fontSize: 13, color: dc.dark },
  mapLock: { position: 'absolute', left: 8, bottom: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6 },
  mapLockText: { fontFamily: fonts.medium, fontSize: 12, color: dc.dark },
  dayTitle: { fontFamily: fonts.bold, fontSize: 15, color: dc.dark, marginTop: 2 },
  slot: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, minHeight: 36 },
  time: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted, width: 38, paddingTop: 1 },
  railWrap: { width: 10, alignItems: 'center', alignSelf: 'stretch' },
  railDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#9DC4A6', marginTop: 3 },
  rail: { flex: 1, width: 1.5, backgroundColor: '#D5DDD7' },
  slotLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 17, color: '#1F2A27' },
  slotNote: { fontFamily: fonts.regular, fontSize: 11, color: dc.muted },
  locked: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F3F0', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, marginTop: 'auto' },
  lockedText: { fontFamily: fonts.medium, fontSize: 12, color: dc.dark, flexShrink: 1 },
  unlockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  unlockText: { fontFamily: fonts.regular, fontSize: 14, color: dc.muted },
  price: { borderRadius: 22, backgroundColor: '#FFFFFF', padding: 14, gap: 10 },
  priceTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  priceTitle: { fontFamily: fonts.bold, fontSize: 18, color: '#0B0B0B' },
  priceSub: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted, marginTop: 1 },
  priceValue: { fontFamily: fonts.bold, fontSize: 22, color: dc.dark, marginTop: 6 },
  priceNote: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  auroraBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  priceFoot: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted, textAlign: 'center' },
  demo: { fontFamily: fonts.medium, fontSize: 12, color: '#8A6100', textAlign: 'center' },
  note: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: dc.muted },
});
