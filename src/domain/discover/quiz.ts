import { parseBrDate } from './dates';
import type { Answers, Need, Experience } from './types';

export type StepId =
  | 'clima' | 'experiencias' | 'alcance' | 'origem' | 'companhia'
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
  { id: 'origem', title: 'De onde você sai?', subtitle: 'Usamos isso para estimar passagem e tempo de deslocamento.', optional: false },
  { id: 'companhia', title: 'Com quem você vai viajar?', optional: false },
  { id: 'cuidados', title: 'Algum cuidado especial?', subtitle: 'Marque o que se aplica ou pule.', optional: true },
  { id: 'periodo', title: 'Quando você pretende viajar?', optional: false },
  { id: 'dias', title: 'Quantos dias de viagem?', subtitle: 'Considere o tempo no destino.', optional: false },
  { id: 'orcamento', title: 'Qual o orçamento por pessoa?', subtitle: 'Valores aproximados, com passagem (ida e volta) e hospedagem.', optional: false },
];

export const MIN_DAYS = 1;
export const MAX_DAYS = 30;
export const DEFAULT_DAYS = 7;

export function emptyAnswers(): Answers {
  return {
    climate: null, experiences: [], reach: null, origin: null, companion: null,
    needs: [], period: { mode: null }, days: DEFAULT_DAYS, budget: null,
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
export function isStepComplete(id: StepId, a: Answers, today: Date = new Date()): boolean {
  switch (id) {
    case 'clima': return a.climate !== null;
    case 'experiencias': return true;
    case 'alcance': return a.reach !== null;
    case 'origem': return a.origin !== null;
    case 'companhia': return a.companion !== null;
    case 'cuidados': return true;
    case 'periodo':
      if (a.period.mode === 'indefinido') return true;
      if (a.period.mode === 'mes') return a.period.month !== null;
      if (a.period.mode === 'definidas') return parseBrDate(a.period.startDate, today) !== null;
      return false;
    case 'dias': return a.days >= MIN_DAYS && a.days <= MAX_DAYS;
    case 'orcamento': return a.budget !== null;
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
