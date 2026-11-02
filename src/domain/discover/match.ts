import { findBudget, BUDGET_TOLERANCE } from './budget';
import type { Answers, Recommendation } from './types';

export interface MatchCriterion {
  id: 'experiencias' | 'clima' | 'companhia' | 'orcamento' | 'duracao';
  label: string;
  earned: number;
  max: number;
}

export interface MatchResult {
  /** 0 a 100, inteiro. */
  percent: number;
  criteria: MatchCriterion[];
}

/**
 * % de match, simples e transparente: soma de pontos por critério que a pessoa respondeu, dividida pelo máximo possível.
 * Experiências 35 · Clima 20 · Companhia 15 · Orçamento 20 (fora se "Ainda não defini") · Duração 10.
 * Critérios sem resposta (ex.: nenhuma experiência marcada) não entram na conta, nem a favor nem contra.
 */
export function matchPercent(rec: Recommendation, a: Answers): MatchResult {
  const d = rec.destination;
  const criteria: MatchCriterion[] = [];

  if (a.experiences.length > 0) {
    const matched = a.experiences.filter((e) => d.experiences.includes(e)).length;
    criteria.push({ id: 'experiencias', label: 'Experiências', earned: (35 * matched) / a.experiences.length, max: 35 });
  }
  if (a.climate) {
    const earned = a.climate === 'tanto-faz' ? 20 : d.climate === a.climate ? 20 : d.climate === 'ameno' ? 10 : 0;
    criteria.push({ id: 'clima', label: 'Clima', earned, max: 20 });
  }
  if (a.companion) {
    criteria.push({ id: 'companhia', label: 'Companhia', earned: d.suits.includes(a.companion) ? 15 : 0, max: 15 });
  }
  const band = findBudget(a.budget, a.customBudget);
  if (band && Number.isFinite(band.max)) {
    const earned = rec.estimatedCost <= band.max ? 20 : rec.estimatedCost <= band.max * BUDGET_TOLERANCE ? 10 : 0;
    criteria.push({ id: 'orcamento', label: 'Orçamento', earned, max: 20 });
  }
  if (a.days >= 1) {
    const earned = a.days >= d.minDays ? 10 : (10 * a.days) / d.minDays;
    criteria.push({ id: 'duracao', label: 'Duração', earned, max: 10 });
  }

  const max = criteria.reduce((n, c) => n + c.max, 0);
  const earned = criteria.reduce((n, c) => n + c.earned, 0);
  return { percent: max === 0 ? 0 : Math.min(100, Math.round((100 * earned) / max)), criteria };
}

/** Só os destinos curtidos, do maior para o menor match (desempate: ordem original do ranking). */
export function likedByMatch(recs: readonly Recommendation[], liked: ReadonlySet<string>, a: Answers): { rec: Recommendation; match: MatchResult }[] {
  return recs
    .map((rec, i) => ({ rec, i, match: matchPercent(rec, a) }))
    .filter((x) => liked.has(x.rec.destination.id))
    .sort((x, y) => y.match.percent - x.match.percent || x.i - y.i)
    .map(({ rec, match }) => ({ rec, match }));
}
