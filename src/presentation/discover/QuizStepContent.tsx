import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BUDGETS } from '../../domain/discover/budget';
import { MONTH_NAMES, maskDate, parseBrDate } from '../../domain/discover/dates';
import { ORIGINS } from '../../domain/discover/geo';
import { MAX_DAYS, MIN_DAYS, clampDays, toggleExperience, toggleNeed, type StepId } from '../../domain/discover/quiz';
import type { Answers, BudgetId, Climate, Companion, Experience, Need, Reach } from '../../domain/discover/types';
import { Input } from '../auth-ui/Input';
import { fonts } from '../theme/auth-theme';
import type { QuizPhotoKey } from './assets';
import type { DiscoverIconName } from './icons';
import { Chip, OptionCard, PhotoCard, cardShadow, dc } from './ui';

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
const NEEDS: { id: Need; label: string; hint: string; icon: DiscoverIconName }[] = [
  { id: 'criancas', label: 'Crianças', hint: 'Ritmo e passeios para os pequenos', icon: 'child' },
  { id: 'idosos', label: 'Idosos', hint: 'Menos deslocamento, mais conforto', icon: 'elder' },
  { id: 'acessibilidade', label: 'Acessibilidade', hint: 'Só mostramos o que for verificado', icon: 'access' },
  { id: 'pets', label: 'Pets', hint: 'Só mostramos o que for verificado', icon: 'paw' },
];
const PERIODS = {
  definidas: { label: 'Tenho datas definidas', hint: 'Informe a data de ida', icon: 'calendar' },
  mes: { label: 'Tenho um mês aproximado', hint: 'Escolha o mês da viagem', icon: 'calendarMonth' },
  indefinido: { label: 'Ainda não sei', hint: 'Tudo bem, seguimos sem data', icon: 'help' },
} as const;
const BUDGET_ICONS: Record<BudgetId, DiscoverIconName> = { 'ate-2k': 'coin1', '2k-5k': 'coin2', '5k-10k': 'coin3', '10k-mais': 'coin4', flexivel: 'infinity' };
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
    case 'origem':
      return (
        <View style={s.originCard}>
          <Text style={s.cardLabel}>Cidade de partida</Text>
          <View style={s.chips}>{ORIGINS.map((o) => <Chip key={o.id} label={o.label} selected={a.origin === o.id} onPress={() => onChange({ origin: o.id })} />)}</View>
        </View>
      );
    case 'companhia':
      return (
        <View style={s.fill}>
          <Row>{COMPANIONS.slice(0, 2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.companion === c.id} onPress={() => onChange({ companion: c.id })} />)}</Row>
          <Row>{COMPANIONS.slice(2).map((c) => <PhotoCard key={c.id} photo={c.photo} title={c.label} subtitle={c.hint} selected={a.companion === c.id} onPress={() => onChange({ companion: c.id })} />)}</Row>
        </View>
      );
    case 'cuidados':
      return (
        <View style={s.list}>
          {NEEDS.map((n) => <OptionCard key={n.id} multi icon={n.icon} label={n.label} hint={n.hint} selected={a.needs.includes(n.id)} onPress={() => onChange({ needs: toggleNeed(a.needs, n.id) })} />)}
        </View>
      );
    case 'periodo': {
      const mode = a.period.mode;
      const startDate = a.period.mode === 'definidas' ? a.period.startDate : '';
      const dateError = startDate.length === 10 && !parseBrDate(startDate, today) ? 'Informe uma data válida a partir de hoje.' : undefined;
      return (
        <View style={s.list}>
          <OptionCard {...PERIODS.definidas} selected={mode === 'definidas'} onPress={() => onChange({ period: { mode: 'definidas', startDate } })} />
          {mode === 'definidas' ? (
            <Input label="Data de ida (DD/MM/AAAA)" keyboardType="number-pad" maxLength={10} placeholder="15/01/2027" value={startDate} error={dateError} onChangeText={(t) => onChange({ period: { mode: 'definidas', startDate: maskDate(t) } })} />
          ) : null}
          <OptionCard {...PERIODS.mes} selected={mode === 'mes'} onPress={() => onChange({ period: { mode: 'mes', month: a.period.mode === 'mes' ? a.period.month : null } })} />
          {mode === 'mes' ? (
            <View style={s.months}>
              {MONTH_NAMES.map((m, i) => <Chip key={m} label={m.slice(0, 3).replace(/^./, (c) => c.toUpperCase())} selected={a.period.mode === 'mes' && a.period.month === i + 1} onPress={() => onChange({ period: { mode: 'mes', month: i + 1 } })} />)}
            </View>
          ) : null}
          <OptionCard {...PERIODS.indefinido} selected={mode === 'indefinido'} onPress={() => onChange({ period: { mode: 'indefinido' } })} />
        </View>
      );
    }
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
      return (
        <View style={s.list}>
          {BUDGETS.map((b) => <OptionCard key={b.id} icon={BUDGET_ICONS[b.id]} label={b.label} hint={b.id === 'flexivel' ? 'Não limitamos por valor' : 'Por pessoa, com passagem e hospedagem'} selected={a.budget === b.id} onPress={() => onChange({ budget: b.id })} />)}
        </View>
      );
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
  originCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: dc.border, padding: 18, gap: 14, ...cardShadow },
  daysCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: dc.border, padding: 18, gap: 16, alignItems: 'center', ...cardShadow },
  cardLabel: { fontFamily: fonts.bold, fontSize: 18, color: dc.dark, alignSelf: 'flex-start' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, paddingVertical: 8 },
  stepBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.bold, fontSize: 30, lineHeight: 34, color: dc.dark },
  daysBox: { minWidth: 100, alignItems: 'center' },
  daysNumber: { fontFamily: fonts.bold, fontSize: 68, lineHeight: 74, color: dc.dark },
  daysLabel: { fontFamily: fonts.medium, fontSize: 16, color: dc.muted },
  range: { fontFamily: fonts.regular, fontSize: 13, color: '#6F7773' },
});
