import { findBudget } from './budget';
import { isMonthYearValid, nightsBetween, parseBrDate } from './dates';
import { resolveOrigin } from './geo';
import type { Answers, Need, Experience } from './types';

export type StepId =
  | 'clima' | 'experiencias' | 'alcance' | 'companhia'
  | 'cuidados' | 'periodo' | 'dias' | 'orcamento';

export interface StepDef {
  id: StepId;
  title: string;
  subtitle?: string;
  /** Pode ser pulada sem responder. */
  optional: boolean;
}

export const STEPS: readonly StepDef[] = [
  { id: 'clima', title: 'Qual clima você procura?', subtitle: 'Escolha o que mais combina com a sua viagem.', optional: false },
  { id: 'experiencias', title: 'Que tipo de lugar te atrai?', subtitle: 'Você pode escolher mais de uma opção.', optional: true },
  { id: 'alcance', title: 'Até onde você quer ir?', optional: false },
  { id: 'companhia', title: 'Com quem você vai viajar?', optional: false },
  { id: 'cuidados', title: 'Algum cuidado especial?', subtitle: 'Marque o que se aplica ou pule.', optional: true },
  { id: 'periodo', title: 'Quando começa sua próxima viagem?', subtitle: 'Datas exatas, só o mês ou ainda nada.', optional: false },
  { id: 'dias', title: 'Quantos dias de viagem?', subtitle: 'Considere o tempo no destino.', optional: false },
  { id: 'orcamento', title: 'Qual é seu orçamento por pessoa?', subtitle: 'Para toda a viagem, incluindo passagem de ida e volta e hospedagem.', optional: false },
];

export const MIN_DAYS = 1;
export const MAX_DAYS = 30;
export const DEFAULT_DAYS = 7;

export function emptyAnswers(originText?: string | null): Answers {
  const o = resolveOrigin(originText);
  return {
    climate: null, experiences: [], reach: null, origin: o.id, originAssumed: o.assumed, companion: null,
    needs: [], period: { mode: null }, days: DEFAULT_DAYS, budget: null, customBudget: null,
  };
}

export function clampDays(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_DAYS;
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(n)));
}

/** Alterna um item numa lista sem mutar (multi-seleção). */
export function toggle<T>(list: readonly T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function toggleExperience(list: readonly Experience[], item: Experience): Experience[] {
  return toggle(list, item);
}
export function toggleNeed(list: readonly Need[], item: Need): Need[] {
  return toggle(list, item);
}

/** Uma etapa está completa quando a resposta é válida. Opcionais sempre estão (podem ficar vazias). */
/** Dias definidos pelas datas (ida e volta válidas), ou null se ainda precisamos perguntar. */
export function daysFromDates(a: Answers): number | null {
  if (a.period.mode !== 'definidas') return null;
  const nights = nightsBetween(a.period.startDate, a.period.endDate);
  return nights === null ? null : Math.min(MAX_DAYS, Math.max(MIN_DAYS, nights));
}

/** Etapas exibidas: a de duração só aparece quando as datas não definem os dias (ex.: "Ainda não sei"). */
export function visibleSteps(a: Answers): readonly StepDef[] {
  return daysFromDates(a) === null ? STEPS : STEPS.filter((s) => s.id !== 'dias');
}

/** Respostas finais: com datas exatas, os dias vêm do intervalo escolhido. */
export function finalizeAnswers(a: Answers): Answers {
  const d = daysFromDates(a);
  return d === null ? a : { ...a, days: d };
}

export function isStepComplete(id: StepId, a: Answers, today: Date = new Date()): boolean {
  switch (id) {
    case 'clima': return a.climate !== null;
    case 'experiencias': return true;
    case 'alcance': return a.reach !== null;
    case 'companhia': return a.companion !== null;
    case 'cuidados': return true;
    case 'periodo':
      if (a.period.mode === 'indefinido') return true;
      if (a.period.mode === 'mes') return isMonthYearValid(a.period.month, a.period.year, today);
      if (a.period.mode === 'definidas') return parseBrDate(a.period.startDate, today) !== null;
      return false;
    case 'dias': return a.days >= MIN_DAYS && a.days <= MAX_DAYS;
    case 'orcamento': return findBudget(a.budget, a.customBudget) !== undefined;
  }
}

/** Fração concluída da barra de progresso, em [0, 1], ao estar na etapa `index` (0-based). */
export function progressFraction(index: number): number {
  const total = STEPS.length;
  return Math.min(1, Math.max(0, (index + 1) / total));
}

export function monthOfPeriod(a: Answers, today: Date = new Date()): number | null {
  const p = a.period;
  if (p.mode === 'mes') return p.month;
  if (p.mode === 'definidas') return parseBrDate(p.startDate, today)?.month ?? null;
  return null;
}
