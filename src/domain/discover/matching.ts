import { BUDGETS, BUDGET_TOLERANCE, findBudget, formatBRL } from './budget';
import { DESTINATIONS } from './catalog';
import { MONTH_NAMES } from './dates';
import { NEAR_HOME_KM, distanceKm, findOrigin, transportCost } from './geo';
import { monthOfPeriod } from './quiz';
import type { Answers, CareNote, Companion, Destination, Experience, Need, Recommendation } from './types';

export const MAX_RESULTS = 10;

const COMPANION_PHRASE: Record<Companion, string> = {
  casal: 'uma viagem a dois',
  amigos: 'uma viagem com amigos',
  familia: 'uma viagem em família',
  solo: 'uma viagem solo',
};

/** Pronto para ranquear: todas as perguntas obrigatórias respondidas. */
export function isReadyToRank(a: Answers): boolean {
  return a.climate !== null && a.reach !== null && findOrigin(a.origin) !== undefined && a.companion !== null && a.budget !== null;
}

export function estimateCost(d: Destination, originRegion: Parameters<typeof transportCost>[0], days: number) {
  const transport = transportCost(originRegion, d.zone, d.domestic);
  return { transport, total: transport + d.dailyCost * days };
}

/** Regras eliminatórias: viagem inviável (alcance, duração, orçamento, clima oposto, restrição verificada). */
export function passesHardFilters(d: Destination, a: Answers): boolean {
  const origin = findOrigin(a.origin);
  const budget = findBudget(a.budget);
  if (!origin || !budget || !a.reach || !a.climate) return false;

  if (a.reach === 'internacional' && d.domestic) return false;
  if (a.reach !== 'internacional' && !d.domestic) return false;
  if (a.reach === 'perto' && distanceKm(origin.region, d.zone) > NEAR_HOME_KM) return false;

  if (a.days < d.minDays) return false;

  const { total } = estimateCost(d, origin.region, a.days);
  if (total > budget.max * BUDGET_TOLERANCE) return false;

  if (a.climate === 'frio' && d.climate === 'calor') return false;
  if (a.climate === 'calor' && d.climate === 'frio') return false;

  // Só elimina quando a restrição é VERIFICADA. Sem verificação, o destino segue e exibimos o aviso.
  if (a.needs.includes('pets') && d.pets.verified && !d.pets.allowed) return false;
  if (a.needs.includes('acessibilidade') && d.accessibility.verified && !d.accessibility.allowed) return false;

  return true;
}

function scoreOf(d: Destination, a: Answers, total: number, month: number | null): number {
  let score = 0;
  if (a.experiences.length > 0) {
    const matched = a.experiences.filter((e) => d.experiences.includes(e)).length;
    score += (40 * matched) / a.experiences.length;
  } else {
    score += 20;
  }
  if (a.climate === 'tanto-faz') score += 10;
  else if (d.climate === 'ameno') score += 8;
  else score += 15;
  if (a.companion && d.suits.includes(a.companion)) score += 15;
  if (a.needs.includes('criancas')) score += d.kidFriendly ? 5 : -10;
  if (a.needs.includes('idosos')) score += d.seniorFriendly ? 5 : -10;

  const band = findBudget(a.budget) ?? BUDGETS[BUDGETS.length - 1]!;
  if (band.id === 'flexivel') score += 5;
  else if (total >= band.min && total <= band.max) score += 10;
  else if (total < band.min) score += 6;
  else score += 2;

  if (month !== null && d.bestMonths.includes(month)) score += 5;
  return score;
}

export function careNotes(d: Destination, needs: readonly Need[]): CareNote[] {
  const notes: CareNote[] = [];
  if (needs.includes('pets')) {
    notes.push(
      d.pets.verified && d.pets.allowed
        ? { need: 'pets', tone: 'ok', text: `Pets: aceitos (informação verificada).${d.pets.note ? ` ${d.pets.note}` : ''}` }
        : { need: 'pets', tone: 'warn', text: 'Pets: confirme antes de reservar.' },
    );
  }
  if (needs.includes('acessibilidade')) {
    notes.push(
      d.accessibility.verified && d.accessibility.allowed
        ? { need: 'acessibilidade', tone: 'ok', text: `Acessibilidade: verificada.${d.accessibility.note ? ` ${d.accessibility.note}` : ''}` }
        : { need: 'acessibilidade', tone: 'warn', text: 'Acessibilidade: confirme antes de reservar.' },
    );
  }
  return notes;
}

function joinPt(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/** "Por que combina com você": só usa fatos que a pessoa escolheu e que o destino realmente atende. */
export function buildWhy(d: Destination, a: Answers, total: number, month: number | null): string {
  const originLabel = findOrigin(a.origin)?.label;
  const choices: string[] = a.experiences.filter((e: Experience) => d.experiences.includes(e));
  if (a.climate === 'calor' && d.climate === 'calor') choices.push('calor');
  if (a.climate === 'frio' && d.climate === 'frio') choices.push('frio');
  if (a.companion && d.suits.includes(a.companion)) choices.push(COMPANION_PHRASE[a.companion]);

  const parts: string[] = [];
  parts.push(choices.length > 0 ? `Você escolheu ${joinPt(choices)}.` : 'Cabe no que você informou sobre origem, duração e orçamento.');
  const budget = findBudget(a.budget);
  const fit = budget && budget.id !== 'flexivel' && total <= budget.max ? ' Isso cabe no seu orçamento.' : '';
  parts.push(`${originLabel ? (a.originAssumed ? `Sem origem informada, estimamos a partir de ${originLabel}: ` : `Saindo de ${originLabel}, `) : ''}a estimativa é de cerca de ${formatBRL(total)} por pessoa para ${a.days} ${a.days === 1 ? 'dia' : 'dias'}.${fit}`);
  if (month !== null && d.bestMonths.includes(month)) parts.push(`${capitalize(MONTH_NAMES[month - 1] ?? '')} é uma boa época para ir.`);
  return parts.join(' ');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Filtra o inviável, ranqueia pelo perfil e devolve até `limit` (padrão 10). Determinístico (desempate por id). */
export function recommend(
  a: Answers,
  catalog: readonly Destination[] = DESTINATIONS,
  today: Date = new Date(),
  limit: number = MAX_RESULTS,
): Recommendation[] {
  if (!isReadyToRank(a)) return [];
  const origin = findOrigin(a.origin)!;
  const month = monthOfPeriod(a, today);
  return catalog
    .filter((d) => passesHardFilters(d, a))
    .map((d) => {
      const { transport, total } = estimateCost(d, origin.region, a.days);
      return {
        destination: d,
        score: scoreOf(d, a, total, month),
        estimatedCost: total,
        transportCost: transport,
        why: buildWhy(d, a, total, month),
        care: careNotes(d, a.needs),
      };
    })
    .sort((x, y) => y.score - x.score || x.destination.id.localeCompare(y.destination.id))
    .slice(0, Math.max(0, limit));
}
