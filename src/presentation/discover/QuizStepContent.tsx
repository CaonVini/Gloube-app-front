import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
const DAY_PRESETS = [3, 5, 7, 10, 14];

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
      const pct = ((a.days - MIN_DAYS) / (MAX_DAYS - MIN_DAYS)) * 100;
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
          <View style={s.trackBox}>
            <View style={s.track}><View style={[s.trackFill, { width: `${pct}%` }]} /><View style={[s.knob, { left: `${pct}%` }]} /></View>
            <View style={s.trackLabels}><Text style={s.range}>{MIN_DAYS} dia</Text><Text style={s.range}>{MAX_DAYS} dias</Text></View>
          </View>
          <View style={s.presets}>
            {DAY_PRESETS.map((d) => {
              const on = a.days === d;
              return (
                <Pressable key={d} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${d} dias`} onPress={() => onChange({ days: d })} style={({ pressed }) => [s.preset, on && s.presetOn, pressed && { opacity: 0.85 }]}>
                  <Text style={[s.presetText, on && s.presetTextOn]}>{d}</Text>
                </Pressable>
              );
            })}
          </View>
          
        </View>
      );
    }
    case 'orcamento':
      return <BudgetStep answers={a} onChange={onChange} />;
  }
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
  track: { height: 2, borderRadius: 1, backgroundColor: '#D9DDDA', justifyContent: 'center' },
  trackFill: { position: 'absolute', left: 0, height: 2, backgroundColor: dc.dark },
  knob: { position: 'absolute', width: 14, height: 14, borderRadius: 7, marginLeft: -7, backgroundColor: dc.lime, borderWidth: 1.5, borderColor: dc.dark },
  trackLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  presets: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', justifyContent: 'center' },
  preset: { flex: 1, maxWidth: 62, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D9DDDA', alignItems: 'center', justifyContent: 'center' },
  presetOn: { backgroundColor: dc.dark, borderColor: dc.dark },
  presetText: { fontFamily: fonts.medium, fontSize: 16, color: dc.dark },
  presetTextOn: { color: '#FFFFFF', fontFamily: fonts.semibold },
  range: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted },
});
