import { FALLBACK_EXPERIENCE, distributePlaces, suggestedDays, type Place } from './places';
import { MONTH_NAMES, parseBrParts } from './dates';
import type { Answers, Companion, Experience, Period, Recommendation } from './types';

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

/** Só avisos de cuidado (pets/acessibilidade): os textos de rodapé genéricos da prévia foram removidos. */
function baseNotes(needs: readonly string[], _hadPlaces: boolean): string[] {
  const notes: string[] = [];
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
    notes: baseNotes(needs, places.length > 0),
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

const MONTH_ABBR = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;
const SLOT_TIMES = ['10:00', '12:00', '15:00'] as const;
const COMPANION_CHIP: Record<Companion, string> = { casal: 'Casal', amigos: 'Amigos', familia: 'Família', solo: 'Solo' };
const TRAVELERS: Record<Companion, string> = { casal: '2 viajantes', solo: '1 viajante', amigos: 'Com amigos', familia: 'Em família' };

/** "12–16 dez", "28 dez – 3 jan", "julho de 2027" ou "Datas a definir". */
export function periodLabel(period: Period | undefined): string {
  if (!period) return 'Datas a definir';
  if (period.mode === 'mes' && period.month !== null && period.year !== null) {
    const m = MONTH_NAMES[period.month - 1] ?? '';
    return `${m.charAt(0).toUpperCase()}${m.slice(1)} de ${period.year}`;
  }
  if (period.mode === 'definidas') {
    const s = parseBrParts(period.startDate);
    if (!s) return 'Datas a definir';
    const e = parseBrParts(period.endDate);
    if (!e) return `${s.day} ${MONTH_ABBR[s.month - 1]}`;
    if (e.month === s.month && e.year === s.year) return `${s.day}–${e.day} ${MONTH_ABBR[s.month - 1]}`;
    return `${s.day} ${MONTH_ABBR[s.month - 1]} – ${e.day} ${MONTH_ABBR[e.month - 1]}`;
  }
  return 'Datas a definir';
}

export interface TripPreview {
  id: string;
  destination: string;
  country: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  /** null quando a companhia não é conhecida (ex.: atalho com destino definido). */
  travelersLabel: string | null;
  chips: string[];
  /** Pré-visualização do dia 1: horários SUGERIDOS e os locais escolhidos. */
  dayOne: { time: string; label: string }[];
  /** Nomes dos locais que viram pinos no mapa ilustrativo. */
  pins: string[];
  /** "Dias 2–5 bloqueados"; null quando a viagem tem 1 dia. */
  lockedLabel: string | null;
  notes: string[];
}

/** Prévia "Sua viagem já tem forma." com dados reais do fluxo. Determinística e local; nada é inventado além dos horários sugeridos. */
export function buildTripPreview(a: {
  id: string;
  name: string;
  country: string;
  days: number;
  places: readonly Place[];
  period?: Period;
  companion?: Companion | null;
  needs?: readonly string[];
  /** Dias não vieram de datas exatas nem das respostas (atalho): acrescenta o aviso de duração sugerida. */
  suggestedDuration?: boolean;
}): TripPreview {
  const days = Math.max(1, Math.round(a.days));
  const perDay = a.places.length / Math.max(1, days - 1);
  const chips = [`${days} ${days === 1 ? 'dia' : 'dias'}`];
  if (a.companion) chips.push(COMPANION_CHIP[a.companion]);
  chips.push(a.places.length === 0 ? 'Ritmo livre' : perDay <= 2 ? 'Ritmo tranquilo' : 'Ritmo animado');

  const names = a.places.slice(0, SLOT_TIMES.length).map((p) => p.name);
  const generic = buildDays(days, [], []).at(0)?.items ?? [];
  const labels = [...names, ...generic].slice(0, SLOT_TIMES.length);
  const notes = [...baseNotes(a.needs ?? [], a.places.length > 0)];
  return {
    id: a.id,
    destination: a.name,
    country: a.country,
    title: 'Sua viagem já tem forma.',
    subtitle: `${days} ${days === 1 ? 'dia' : 'dias'} em ${a.name}, do seu jeito.`,
    dateLabel: periodLabel(a.period),
    travelersLabel: a.companion ? TRAVELERS[a.companion] : null,
    chips,
    dayOne: labels.map((label, i) => ({ time: SLOT_TIMES[i]!, label })),
    pins: names,
    lockedLabel: days > 1 ? `${days > 2 ? `Dias 2–${days}` : 'Dia 2'} ${days > 2 ? 'bloqueados' : 'bloqueado'}` : null,
    notes,
  };
}
