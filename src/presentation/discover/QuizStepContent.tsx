import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MONTH_NAMES, maskDate, parseBrDate } from '../../domain/discover/dates';
import { BUDGETS } from '../../domain/discover/budget';
import { ORIGINS } from '../../domain/discover/geo';
import { MAX_DAYS, MIN_DAYS, clampDays, toggleExperience, toggleNeed, type StepId } from '../../domain/discover/quiz';
import type { Answers, BudgetId, Climate, Companion, Experience, Need, Reach } from '../../domain/discover/types';
import { Input } from '../auth-ui/Input';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import type { DiscoverIconName } from './icons';
import { Chip, ImageTile, OptionCard, dc } from './ui';

const CLIMATES: { id: Climate; label: string; hint: string; icon: DiscoverIconName }[] = [
  { id: 'frio', label: 'Frio', hint: 'Cobertor, lareira e clima de montanha.', icon: 'flake' },
  { id: 'calor', label: 'Calor', hint: 'Sol, mar e roupas leves.', icon: 'sun' },
  { id: 'tanto-faz', label: 'Tanto faz', hint: 'O clima não é decisivo para mim.', icon: 'contrast' },
];
const EXPERIENCES: { id: Experience; label: string }[] = [
  { id: 'praia', label: 'Praia' }, { id: 'montanha', label: 'Montanha' }, { id: 'cidade', label: 'Cidade' },
  { id: 'natureza', label: 'Natureza' }, { id: 'neve', label: 'Neve' },
];
const REACHES: { id: Reach; label: string; hint: string; icon: DiscoverIconName }[] = [
  { id: 'perto', label: 'Perto de casa', hint: 'Destinos nacionais a até ~1.000 km da sua cidade.', icon: 'home' },
  { id: 'brasil', label: 'Pelo Brasil', hint: 'Qualquer lugar do país.', icon: 'pin' },
  { id: 'internacional', label: 'Internacional', hint: 'Fora do Brasil (pode exigir passaporte e visto).', icon: 'world' },
];
const COMPANIONS: { id: Companion; label: string; hint: string; icon: DiscoverIconName }[] = [
  { id: 'casal', label: 'Casal', hint: 'Uma viagem a dois.', icon: 'couple' },
  { id: 'amigos', label: 'Amigos', hint: 'Aventura em grupo.', icon: 'friends' },
  { id: 'familia', label: 'Família', hint: 'Todo mundo junto.', icon: 'family' },
  { id: 'solo', label: 'Solo', hint: 'Só você e o mundo.', icon: 'solo' },
];
const NEEDS: { id: Need; label: string; hint: string; icon: DiscoverIconName }[] = [
  { id: 'criancas', label: 'Crianças', hint: 'Passeios e ritmo pensados para os pequenos.', icon: 'child' },
  { id: 'idosos', label: 'Idosos', hint: 'Menos deslocamento e mais conforto.', icon: 'elder' },
  { id: 'acessibilidade', label: 'Acessibilidade', hint: 'Só mostramos como adequado o que for verificado.', icon: 'access' },
  { id: 'pets', label: 'Pets', hint: 'Só mostramos como adequado o que for verificado.', icon: 'paw' },
];
const PERIODS = {
  definidas: { label: 'Tenho datas definidas', hint: 'Informe a data de ida.', icon: 'calendar' },
  mes: { label: 'Tenho um mês aproximado', hint: 'Escolha o mês da viagem.', icon: 'calendarMonth' },
  indefinido: { label: 'Ainda não sei', hint: 'Tudo bem, a gente segue sem data.', icon: 'help' },
} as const;
const BUDGET_ICONS: Record<BudgetId, DiscoverIconName> = { 'ate-2k': 'coin1', '2k-5k': 'coin2', '5k-10k': 'coin3', '10k-mais': 'coin4', flexivel: 'infinity' };

interface Props {
  step: StepId;
  answers: Answers;
  onChange: (patch: Partial<Answers>) => void;
  today: Date;
}

/** Conteúdo de cada etapa do questionário. Sem estado próprio: tudo vem de `answers` (fonte única). */
export function QuizStepContent({ step, answers: a, onChange, today }: Props) {
  const { width } = useWindowDimensions();
  const tileSize = useMemo(() => Math.floor((Math.min(width, 480 + 32) - 32 - 12) / 2), [width]);

  switch (step) {
    case 'clima':
      return <View style={s.list}>{CLIMATES.map((c) => <OptionCard key={c.id} icon={c.icon} label={c.label} hint={c.hint} selected={a.climate === c.id} onPress={() => onChange({ climate: c.id })} />)}</View>;
    case 'experiencias':
      return (
        <View style={s.grid}>
          {EXPERIENCES.map((e) => (
            <ImageTile key={e.id} kind={e.id} label={e.label} size={tileSize} selected={a.experiences.includes(e.id)} onPress={() => onChange({ experiences: toggleExperience(a.experiences, e.id) })} />
          ))}
        </View>
      );
    case 'alcance':
      return <View style={s.list}>{REACHES.map((r) => <OptionCard key={r.id} icon={r.icon} label={r.label} hint={r.hint} selected={a.reach === r.id} onPress={() => onChange({ reach: r.id })} />)}</View>;
    case 'origem':
      return <View style={s.chips}>{ORIGINS.map((o) => <Chip key={o.id} label={o.label} selected={a.origin === o.id} onPress={() => onChange({ origin: o.id })} />)}</View>;
    case 'companhia':
      return <View style={s.list}>{COMPANIONS.map((c) => <OptionCard key={c.id} icon={c.icon} label={c.label} hint={c.hint} selected={a.companion === c.id} onPress={() => onChange({ companion: c.id })} />)}</View>;
    case 'cuidados':
      return <View style={s.list}>{NEEDS.map((n) => <OptionCard key={n.id} multi icon={n.icon} label={n.label} hint={n.hint} selected={a.needs.includes(n.id)} onPress={() => onChange({ needs: toggleNeed(a.needs, n.id) })} />)}</View>;
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
            <View style={s.chips}>
              {MONTH_NAMES.map((m, i) => <Chip key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} selected={a.period.mode === 'mes' && a.period.month === i + 1} onPress={() => onChange({ period: { mode: 'mes', month: i + 1 } })} />)}
            </View>
          ) : null}
          <OptionCard {...PERIODS.indefinido} selected={mode === 'indefinido'} onPress={() => onChange({ period: { mode: 'indefinido' } })} />
        </View>
      );
    }
    case 'dias':
      return (
        <View style={s.stepper}>
          <StepButton label="−" onPress={() => onChange({ days: clampDays(a.days - 1) })} a11y="Diminuir um dia" />
          <View accessibilityLiveRegion="polite" style={s.daysBox}>
            <Text style={s.daysNumber}>{a.days}</Text>
            <Text style={s.daysLabel}>{a.days === 1 ? 'dia' : 'dias'}</Text>
          </View>
          <StepButton label="+" onPress={() => onChange({ days: clampDays(a.days + 1) })} a11y="Aumentar um dia" />
          <Text style={s.range}>De {MIN_DAYS} a {MAX_DAYS} dias</Text>
        </View>
      );
    case 'orcamento':
      return (
        <View style={s.list}>
          {BUDGETS.map((b) => <OptionCard key={b.id} icon={BUDGET_ICONS[b.id]} label={b.label} hint={b.id === 'flexivel' ? 'Não limitamos por valor.' : 'Por pessoa, com passagem e hospedagem.'} selected={a.budget === b.id} onPress={() => onChange({ budget: b.id as BudgetId })} />)}
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
  list: { gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stepBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 32, color: dc.dark },
  stepper: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 18, paddingVertical: 24 },
  daysBox: { minWidth: 90, alignItems: 'center' },
  daysNumber: { fontFamily: fonts.bold, fontSize: 64, lineHeight: 70, color: dc.dark },
  daysLabel: { fontFamily: fonts.medium, fontSize: 16, color: homeColors.subtitle },
  range: { width: '100%', textAlign: 'center', fontFamily: fonts.regular, fontSize: 13, color: authColors.muted },
});
