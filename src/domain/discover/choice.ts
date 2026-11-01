import type { Answers, Experience, Recommendation } from './types';

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

/**
 * Prévia ilustrativa do roteiro a partir do destino confirmado e das respostas. Determinística (sem rede).
 * Nunca afirma acessibilidade ou pets: apenas lembra de confirmar antes de reservar.
 */
export function buildItineraryPreview(rec: Recommendation, a: Answers): ItineraryPreview {
  const d = rec.destination;
  const total = Math.max(1, a.days);
  const exps: readonly Experience[] = d.experiences.length > 0 ? d.experiences : ['cidade'];
  const days: ItineraryDay[] = Array.from({ length: total }, (_, i) => {
    const day = i + 1;
    if (day === 1) return { day, title: 'Chegada e primeiras impressões', items: ['Check-in e descanso da viagem', 'Caminhada leve para conhecer os arredores'] };
    if (day === total && total > 1) return { day, title: 'Últimos passeios e volta', items: ['Manhã livre para lembranças e compras', 'Traslado e voo de volta'] };
    const exp = exps[(day - 2) % exps.length]!;
    const list = ACTIVITIES[exp];
    const first = list[(day - 2) % list.length]!;
    const second = list[(day - 1) % list.length]!;
    return { day, title: `Dia de ${exp}`, items: first === second ? [first] : [first, second] };
  });
  const notes: string[] = ['Prévia ilustrativa: horários, reservas e valores serão refinados nas próximas etapas.'];
  if (a.needs.includes('pets')) notes.push('Pets: confirme as regras de cada hospedagem e passeio antes de reservar.');
  if (a.needs.includes('acessibilidade')) notes.push('Acessibilidade: confirme os acessos de cada local antes de reservar.');
  return {
    title: `${total} ${total === 1 ? 'dia' : 'dias'} em ${d.name}`,
    summary: rec.why,
    days,
    notes,
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
