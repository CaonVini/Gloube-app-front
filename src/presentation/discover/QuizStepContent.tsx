import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_DAYS, MIN_DAYS, clampDays, toggleExperience, toggleNeed, type StepId } from '../../domain/discover/quiz';
import type { Answers, Climate, Companion, Experience, Need, Reach } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import type { QuizPhotoKey } from './assets';
import { BudgetStep, PeriodStep } from './StepWidgets';
import { Chip, PhotoCard, cardShadow, dc } from './ui';

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
    case 'dias':
      return (
        <View style={s.daysCard}>
          <Text style={s.cardLabel}>Duração da viagem</Text>
          <View style={s.stepper}>
            <StepButton label="−" a11y="Diminuir um dia" onPress={() => onChange({ days: clampDays(a.days - 1) })} />
            <View accessibilityLiveRegion="polite" style={s.daysBox}>
              <Text style={s.daysNumber}>{a.days}</Text>
              <Text style={s.daysLabel}>{a.days === 1 ? 'dia' : 'dias'}</Text>
            </View>
            <StepButton label="+" a11y="Aumentar um dia" onPress={() => onChange({ days: clampDays(a.days + 1) })} />
          </View>
          <View style={s.chips}>
            {DAY_PRESETS.map((d) => <Chip key={d} label={`${d} dias`} selected={a.days === d} onPress={() => onChange({ days: d })} />)}
          </View>
          <Text style={s.range}>De {MIN_DAYS} a {MAX_DAYS} dias</Text>
        </View>
      );
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
  list: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  months: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  daysCard: { flex: 1, justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: dc.border, padding: 18, gap: 16, alignItems: 'center', ...cardShadow },
  cardLabel: { fontFamily: fonts.bold, fontSize: 18, color: dc.dark, alignSelf: 'flex-start' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, paddingVertical: 8 },
  stepBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 34, color: dc.dark },
  daysBox: { minWidth: 100, alignItems: 'center' },
  daysNumber: { fontFamily: fonts.bold, fontSize: 68, lineHeight: 74, color: dc.dark },
  daysLabel: { fontFamily: fonts.medium, fontSize: 16, color: dc.muted },
  range: { fontFamily: fonts.regular, fontSize: 13, color: '#6F7773' },
});
