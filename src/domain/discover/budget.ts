import type { BudgetId } from './types';

export interface BudgetBand {
  id: BudgetId;
  label: string;
  min: number;
  max: number; // Infinity = sem teto
}

/** Faixas por pessoa. Os valores incluem passagem (ida e volta) e hospedagem — dito explicitamente na tela. */
export const BUDGETS: readonly BudgetBand[] = [
  { id: 'ate-2k', label: 'Até R$ 2.000', min: 0, max: 2000 },
  { id: '2k-5k', label: 'R$ 2.000 a R$ 5.000', min: 2000, max: 5000 },
  { id: '5k-10k', label: 'R$ 5.000 a R$ 10.000', min: 5000, max: 10000 },
  { id: '10k-mais', label: 'Acima de R$ 10.000', min: 10000, max: Infinity },
  { id: 'flexivel', label: 'Ainda não defini', min: 0, max: Infinity },
];

/** Tolerância acima do teto da faixa antes de considerar a viagem inviável. */
export const BUDGET_TOLERANCE = 1.1;

export function findBudget(id: BudgetId | null): BudgetBand | undefined {
  return BUDGETS.find((b) => b.id === id);
}

/** Formata em reais sem depender de Intl (Hermes/web): 5200 -> "R$ 5.200". */
export function formatBRL(value: number): string {
  const n = Math.round(value);
  return `R$ ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
