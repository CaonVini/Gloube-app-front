import { MONTH_NAMES } from './dates';
import { formatBRL } from './budget';
import type { Destination, Recommendation } from './types';

export interface CompareRow {
  label: string;
  values: string[];
}

const CLIMATE_LABEL = { frio: 'Frio', calor: 'Calor', ameno: 'Ameno' } as const;
const EXP_LABEL = { praia: 'Praia', montanha: 'Montanha', cidade: 'Cidade', natureza: 'Natureza', neve: 'Neve' } as const;

function care(info: Destination['pets']): string {
  if (!info.verified) return 'Confirme antes de reservar';
  return info.allowed ? 'Sim (verificado)' : 'Não (verificado)';
}

function bestMonths(d: Destination): string {
  return d.bestMonths.map((m) => (MONTH_NAMES[m - 1] ?? '').slice(0, 3)).join(', ');
}

/** Monta as linhas da comparação lado a lado (uma coluna por favorito). Pura e testável. */
export function buildComparison(recs: readonly Recommendation[]): CompareRow[] {
  return [
    { label: 'Estimativa por pessoa', values: recs.map((r) => formatBRL(r.estimatedCost)) },
    { label: 'Passagem estimada', values: recs.map((r) => formatBRL(r.transportCost)) },
    { label: 'Mínimo recomendado', values: recs.map((r) => `${r.destination.minDays} dias`) },
    { label: 'Clima', values: recs.map((r) => CLIMATE_LABEL[r.destination.climate]) },
    { label: 'Experiências', values: recs.map((r) => r.destination.experiences.map((e) => EXP_LABEL[e]).join(', ')) },
    { label: 'Melhor época', values: recs.map((r) => bestMonths(r.destination)) },
    { label: 'Aceita pets', values: recs.map((r) => care(r.destination.pets)) },
    { label: 'Acessibilidade', values: recs.map((r) => care(r.destination.accessibility)) },
  ];
}

/** Favoritos na ordem do ranking (não na ordem em que foram salvos). */
export function pickFavorites(recs: readonly Recommendation[], ids: ReadonlySet<string>): Recommendation[] {
  return recs.filter((r) => ids.has(r.destination.id));
}

/** Destaques simples entre os favoritos: o mais barato e o de menor exigência de dias. */
export function comparisonHighlights(recs: readonly Recommendation[]): { cheapestId: string | null; shortestId: string | null } {
  if (recs.length < 2) return { cheapestId: null, shortestId: null };
  const cheapest = [...recs].sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
  const shortest = [...recs].sort((a, b) => a.destination.minDays - b.destination.minDays)[0];
  return { cheapestId: cheapest?.destination.id ?? null, shortestId: shortest?.destination.id ?? null };
}
