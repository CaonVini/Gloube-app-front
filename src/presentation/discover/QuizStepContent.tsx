import type { ReactNode } from 'react';
import { useRef } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { MAX_DAYS, MIN_DAYS, clampDays, toggleExperience, toggleNeed, type StepId } from '../../domain/discover/quiz';
import type { Answers, Climate, Companion, Experience, Need, Reach } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import type { QuizPhotoKey } from './assets';
import { BudgetStep, PeriodStep } from './StepWidgets';
import { PhotoCard, dc } from './ui';

const CLIMATES: { id: Climate; label: string; hint: string; photo: QuizPhotoKey }[] = [
  { id: 'frio', label: 'Frio', hint: 'Refúgios e aconchego', photo: 'clima-frio' },
  { id: 'calor', label: 'Calor', hint: 'Sol e dias leves', photo: 'clima-calor' },
  { id: 'tanto-faz', label: 'Tanto faz', hint: 'O clima não é decisivo para mim', photo: 'clima-tanto-faz' },
];
const EXPERIENCES: { id: Experience; label: string; hint: string; photo: QuizPhotoKey }[] = [
  { id: 'praia', label: 'Praia', hint: 'Mar e areia', photo: 'exp-praia' },
  { id: 'montanha', label: 'Montanha', hint: 'Altitude e vistas', photo: 'exp-montanha' },
  { id: 'cidade', label: 'Cidade', hint: 'Cultura e noites', photo: 'exp-cidade' },
  { id: 'natureza', label: 'Natureza', hint: 'Trilhas e cachoeiras', photo: 'exp-natureza' },
  { id: 'neve', label: 'Neve', hint: 'Paisagens geladas', photo: 'exp-neve' },
];
const REACHES: { id: Reach; label: string; hint: string; photo: QuizPhotoKey }[] = [
  { id: 'perto', label: 'Perto de casa', hint: 'Até ~1.000 km da sua cidade', photo: 'alcance-perto' },
  { id: 'brasil', label: 'Pelo Brasil', hint: 'Qualquer lugar do país', photo: 'alcance-brasil' },
  { id: 'internacional', label: 'Internacional', hint: 'Fora do Brasil (pode exigir passaporte e visto)', photo: 'alcance-internacional' },
];
const COMPANIONS: { id: Companion; label: string; hint: string; photo: QuizPhotoKey }[] = [
  { id: 'casal', label: 'Casal', hint: 'Uma viagem a dois', photo: 'comp-casal' },
  { id: 'amigos', label: 'Amigos', hint: 'Aventura em grupo', photo: 'comp-amigos' },
  { id: 'familia', label: 'Família', hint: 'Todo mundo junto', photo: 'comp-familia' },
  { id: 'solo', label: 'Solo', hint: 'Só você e o mundo', photo: 'comp-solo' },
];
const NEEDS: { id: Need; label: string; hint: string; photo: QuizPhotoKey }[] = [
  { id: 'criancas', label: 'Crianças', hint: 'Passeios para os pequenos', photo: 'care-criancas' },
  { id: 'idosos', label: 'Idosos', hint: 'Mais conforto no ritmo', photo: 'care-idosos' },
  { id: 'acessibilidade', label: 'Acessibilidade', hint: 'Informação verificada', photo: 'care-acessibilidade' },
  { id: 'pets', label: 'Pets', hint: 'Informação verificada', photo: 'care-pets' },
];

interface Props {
  step: StepId;
  answers: Answers;
  onChange: (patch: Partial<Answers>) => void;
  today: Date;
}

function Row({ children }: { children: ReactNode }) {
  return <View style={s.row}>{children}</View>;
}

/** Conteúdo de cada etapa. Ocupa o espaço disponível (flex) para caber na tela sem rolagem. Sem estado próprio. */
export function QuizStepContent({ step, answers: a, onChange, today }: Props) {
  switch (step) {
    case 'clima':
      return (
        <View style={s.fill}>
          <Row>{CLIMATES.slice(0, 2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.climate === c.id} onPress={() => onChange({ climate: c.id })} />)}</Row>
          <Row>{CLIMATES.slice(2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.climate === c.id} onPress={() => onChange({ climate: c.id })} />)}</Row>
        </View>
      );
    case 'experiencias': {
      const toggleE = (id: Experience) => onChange({ experiences: toggleExperience(a.experiences, id) });
      const card = (e: (typeof EXPERIENCES)[number]) => <PhotoCard key={e.id} multi compact photo={e.photo} title={e.label} subtitle={e.hint} selected={a.experiences.includes(e.id)} onPress={() => toggleE(e.id)} />;
      return (
        <View style={s.fill}>
          <Row>{EXPERIENCES.slice(0, 2).map(card)}</Row>
          <Row>{EXPERIENCES.slice(2, 4).map(card)}</Row>
          <Row>{EXPERIENCES.slice(4).map(card)}</Row>
        </View>
      );
    }
    case 'alcance':
      return (
        <View style={s.fill}>
          {REACHES.map((r) => <Row key={r.id}><PhotoCard photo={r.photo} title={r.label} subtitle={r.hint} selected={a.reach === r.id} onPress={() => onChange({ reach: r.id })} /></Row>)}
        </View>
      );
    case 'companhia':
      return (
        <View style={s.fill}>
          <Row>{COMPANIONS.slice(0, 2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.companion === c.id} onPress={() => onChange({ companion: c.id })} />)}</Row>
          <Row>{COMPANIONS.slice(2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.companion === c.id} onPress={() => onChange({ companion: c.id })} />)}</Row>
        </View>
      );
    case 'cuidados': {
      const card = (n: (typeof NEEDS)[number]) => <PhotoCard key={n.id} multi compact photo={n.photo} title={n.label} subtitle={n.hint} selected={a.needs.includes(n.id)} onPress={() => onChange({ needs: toggleNeed(a.needs, n.id) })} />;
      return (
        <View style={s.fill}>
          <Row>{NEEDS.slice(0, 2).map(card)}</Row>
          <Row>{NEEDS.slice(2).map(card)}</Row>
        </View>
      );
    }
    case 'periodo':
      return <PeriodStep answers={a} onChange={onChange} today={today} />;
    case 'dias': {
      return (
        <View style={s.daysCard}>
          <Text style={s.daysKicker}>DURAÇÃO DA VIAGEM</Text>
          <View style={s.stepper}>
            <StepButton label="−" a11y="Diminuir um dia" onPress={() => onChange({ days: clampDays(a.days - 1) })} />
            <View accessibilityLiveRegion="polite" style={s.daysBox}>
              <Text style={s.daysNumber}>{a.days}</Text>
              <Text style={s.daysLabel}>{a.days === 1 ? 'dia' : 'dias'}</Text>
            </View>
            <StepButton label="+" a11y="Aumentar um dia" onPress={() => onChange({ days: clampDays(a.days + 1) })} />
          </View>
          <DaysSlider days={a.days} onChange={(d) => onChange({ days: d })} />
        </View>
      );
    }
    case 'orcamento':
      return <BudgetStep answers={a} onChange={onChange} />;
  }
}

/** Régua fina arrastável (ou toque) de MIN_DAYS a MAX_DAYS. Área de toque alta; a linha visual é fina. */
function DaysSlider({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  const box = useRef<React.ComponentRef<typeof View>>(null);
  const geo = useRef({ left: 0, width: 1 });
  const latest = useRef({ days, onChange });
  latest.current = { days, onChange };
  const set = (pageX: number) => {
    const ratio = Math.min(1, Math.max(0, (pageX - geo.current.left) / geo.current.width));
    const d = clampDays(Math.round(MIN_DAYS + ratio * (MAX_DAYS - MIN_DAYS)));
    if (d !== latest.current.days) latest.current.onChange(d);
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.pageX;
        box.current?.measureInWindow((left, _y, width) => { geo.current = { left, width: Math.max(1, width) }; set(x); });
      },
      onPanResponderMove: (_e, g) => set(g.moveX),
    }),
  ).current;
  const onLayout = (_e: LayoutChangeEvent) => box.current?.measureInWindow((left, _y, width) => { geo.current = { left, width: Math.max(1, width) }; });
  const pct = ((days - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
  return (
    <View style={s.trackBox}>
      <View
        ref={box}
        onLayout={onLayout}
        {...pan.panHandlers}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Duração da viagem em dias"
        accessibilityValue={{ min: MIN_DAYS, max: MAX_DAYS, now: days }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(ev) => onChange(clampDays(days + (ev.nativeEvent.actionName === 'increment' ? 1 : -1)))}
        style={s.trackHit}
      >
        <View style={s.track}><View style={[s.trackFill, { width: `${pct}%` }]} /><View style={[s.knob, { left: `${pct}%` }]} /></View>
      </View>
      <View style={s.trackLabels}><Text style={s.range}>{MIN_DAYS} dia</Text><Text style={s.range}>{MAX_DAYS} dias</Text></View>
    </View>
  );
}

function StepButton({ label, onPress, a11y }: { label: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={a11y} onPress={onPress} style={({ pressed }) => [s.stepBtn, pressed && { opacity: 0.8 }]}>
      <Text style={s.stepBtnText}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, gap: 12 },
  row: { flex: 1, flexDirection: 'row', gap: 12 },
  daysCard: { flex: 1, justifyContent: 'space-evenly', alignItems: 'center', paddingVertical: 8 },
  daysKicker: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 2, color: dc.muted },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', paddingHorizontal: 8 },
  stepBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: dc.dark, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.regular, fontSize: 28, lineHeight: 32, color: dc.dark },
  daysBox: { alignItems: 'center' },
  daysNumber: { fontFamily: fonts.bold, fontSize: 96, lineHeight: 104, letterSpacing: -3, color: dc.dark },
  daysLabel: { fontFamily: fonts.regular, fontSize: 16, letterSpacing: 1, color: dc.muted },
  trackBox: { alignSelf: 'stretch', gap: 10, paddingHorizontal: 8 },
  trackHit: { height: 40, justifyContent: 'center' },
  track: { height: 2, borderRadius: 1, backgroundColor: '#D9DDDA', justifyContent: 'center' },
  trackFill: { position: 'absolute', left: 0, height: 2, backgroundColor: dc.dark },
  knob: { position: 'absolute', width: 22, height: 22, borderRadius: 11, marginLeft: -11, top: -10, backgroundColor: dc.lime, borderWidth: 1.5, borderColor: dc.dark },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  range: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted },
});
