import { FALLBACK_EXPERIENCE, distributePlaces, suggestedDays, type Place } from './places';
import { MONTH_NAMES } from './dates';
import type { Answers, Experience, Period, Recommendation } from './types';

/** Todas as sugestões na ordem da tela final: favoritos primeiro (mantendo o ranking), depois as demais. */
export function orderForChoice(recs: readonly Recommendation[], favorites: ReadonlySet<string>): Recommendation[] {
  return [...recs.filter((r) => favorites.has(r.destination.id)), ...recs.filter((r) => !favorites.has(r.destination.id))];
}

/** Primeira frase de um texto (resumo curto do motivo da recomendação). */
export function firstSentence(text: string): string {
  const m = /^.*?[.!?](?=\s|$)/.exec(text.trim());
  return (m ? m[0] : text).trim();
}

const ACTIVITIES: Record<Experience, readonly string[]> = {
  praia: ['Manhã na praia mais tranquila da região', 'Passeio de barco no fim da tarde', 'Dia de descanso e culinária local'],
  montanha: ['Trilha leve até um mirante', 'Visita a um vilarejo de altitude', 'Café da tarde com vista panorâmica'],
  cidade: ['Centro histórico a pé', 'Museus, mercados e cafés', 'Jantar típico e passeio noturno'],
  natureza: ['Cachoeiras e áreas verdes', 'Caminhada guiada pela natureza', 'Dia ao ar livre, sem pressa'],
  neve: ['Primeiro contato com a neve e as paisagens', 'Atividade na neve para o seu ritmo', 'Tarde de refúgio com chocolate quente'],
};

export interface ItineraryDay {
  day: number;
  title: string;
  items: string[];
}

export interface ItineraryPreview {
  title: string;
  summary: string;
  days: ItineraryDay[];
  notes: string[];
}

function placeTitle(ps: readonly Place[]): string {
  if (ps.length === 1) return ps[0]!.name;
  if (ps.length === 2) return `${ps[0]!.name} e ${ps[1]!.name}`;
  return `${ps[0]!.name} e mais ${ps.length - 1}`;
}

/** Monta os dias: chegada e volta + locais escolhidos distribuídos; sem locais, sugestões gerais por experiência. */
export function buildDays(total: number, exps: readonly Experience[], places: readonly Place[]): ItineraryDay[] {
  const n = Math.max(1, total);
  const perDay = distributePlaces(places, n);
  const base = exps.length > 0 ? exps : [FALLBACK_EXPERIENCE];
  return Array.from({ length: n }, (_, i) => {
    const day = i + 1;
    const mine = perDay[i]!.map((p) => `Visita: ${p.name}`);
    if (day === 1) return { day, title: 'Chegada e primeiras impressões', items: ['Check-in e descanso da viagem', ...(mine.length ? mine : ['Caminhada leve para conhecer os arredores'])] };
    if (day === n) return { day, title: 'Últimos passeios e volta', items: [...mine, 'Manhã livre para lembranças e compras', 'Traslado e voo de volta'] };
    if (mine.length > 0) return { day, title: placeTitle(perDay[i]!), items: mine };
    const exp = base[(day - 2) % base.length]!;
    const list = ACTIVITIES[exp];
    const first = list[(day - 2) % list.length]!;
    const second = list[(day - 1) % list.length]!;
    return { day, title: `Dia de ${exp}`, items: first === second ? [first] : [first, second] };
  });
}

/** Aviso sobre datas: sem datas exatas, a prévia é só uma estimativa. null quando as datas são exatas. */
export function periodNote(period: Period): string | null {
  if (period.mode === 'definidas') return null;
  if (period.mode === 'mes' && period.month !== null && period.year !== null) {
    return `Sem datas exatas: considerei ${MONTH_NAMES[period.month - 1]} de ${period.year}. A duração e os valores podem mudar quando você definir os dias.`;
  }
  return 'Sem datas definidas: a duração é a que você informou e os valores podem mudar quando você escolher as datas.';
}

function baseNotes(needs: readonly string[], hadPlaces: boolean): string[] {
  const notes: string[] = [hadPlaces
    ? 'Prévia ilustrativa montada com os locais que você escolheu: horários, reservas e valores serão refinados nas próximas etapas.'
    : 'Prévia ilustrativa: você não escolheu locais, então sugerimos um roteiro geral. Horários, reservas e valores serão refinados depois.'];
  if (needs.includes('pets')) notes.push('Pets: confirme as regras de cada hospedagem e passeio antes de reservar.');
  if (needs.includes('acessibilidade')) notes.push('Acessibilidade: confirme os acessos de cada local antes de reservar.');
  return notes;
}

/**
 * Prévia ilustrativa do roteiro a partir do destino confirmado, das respostas e dos locais escolhidos.
 * Determinística (sem rede). Nunca afirma acessibilidade ou pets: apenas lembra de confirmar antes de reservar.
 */
export function buildItineraryPreview(rec: Recommendation, a: Answers, places: readonly Place[] = []): ItineraryPreview {
  const d = rec.destination;
  const total = Math.max(1, a.days);
  return {
    title: `${total} ${total === 1 ? 'dia' : 'dias'} em ${d.name}`,
    summary: rec.why,
    days: buildDays(total, d.experiences, places),
    notes: [...baseNotes(a.needs, places.length > 0), ...(periodNote(a.period) ? [periodNote(a.period)!] : [])],
  };
}

/** Prévia para quem já chegou com o destino definido (sem questionário): dias sugeridos pela quantidade de locais. */
export function buildDirectPreview(cityName: string, places: readonly Place[], needs: readonly string[] = []): ItineraryPreview {
  const total = suggestedDays(places.length);
  return {
    title: `${total} ${total === 1 ? 'dia' : 'dias'} em ${cityName}`,
    summary: '',
    days: buildDays(total, [], places),
    notes: [...baseNotes(needs, places.length > 0), 'Duração sugerida pela quantidade de locais; as datas ficam para a próxima etapa.'],
  };
}

/** "Gostei" favorita (idempotente); "não gostei" não altera os favoritos. Não muta o conjunto original. */
export function applyReaction(favorites: ReadonlySet<string>, id: string, liked: boolean): ReadonlySet<string> {
  if (!liked || favorites.has(id)) return favorites;
  const next = new Set(favorites);
  next.add(id);
  return next;
}

/** Índice do próximo card após reagir ao atual, ou `null` quando era o último (hora de comparar). */
export function nextCardIndex(index: number, total: number): number | null {
  return index + 1 < total ? index + 1 : null;
}
