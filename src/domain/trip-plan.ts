/** Regras puras do planejamento de viagem (sem UI, sem rede): fictício/local por enquanto. */
export interface Destination {
  id: string;
  city: string;
  country: string;
}

export const MAX_DESTINATIONS = 10;
export const MAX_SUGGESTIONS = 5;

/** Catálogo local usado na busca simulada. */
export const DESTINATION_CATALOG: readonly Destination[] = [
  { id: 'paris', city: 'Paris', country: 'França' },
  { id: 'roma', city: 'Roma', country: 'Itália' },
  { id: 'lisboa', city: 'Lisboa', country: 'Portugal' },
  { id: 'madri', city: 'Madri', country: 'Espanha' },
  { id: 'barcelona', city: 'Barcelona', country: 'Espanha' },
  { id: 'londres', city: 'Londres', country: 'Reino Unido' },
  { id: 'amsterda', city: 'Amsterdã', country: 'Países Baixos' },
  { id: 'berlim', city: 'Berlim', country: 'Alemanha' },
  { id: 'toquio', city: 'Tóquio', country: 'Japão' },
  { id: 'nova-york', city: 'Nova York', country: 'Estados Unidos' },
  { id: 'buenos-aires', city: 'Buenos Aires', country: 'Argentina' },
  { id: 'santiago', city: 'Santiago', country: 'Chile' },
];

/** Cidade de partida devolvida pelo "Usar minha localização" simulado (nenhuma permissão é pedida). */
export const SIMULATED_ORIGIN = 'São Paulo, Brasil';

/** Minúsculas e sem acentos, para busca tolerante ("amsterda" encontra "Amsterdã"). */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Sugestões que casam com a busca, ignorando as já escolhidas. Busca vazia não sugere nada. */
export function searchDestinations(query: string, selected: readonly Destination[], catalog = DESTINATION_CATALOG): Destination[] {
  const q = normalize(query);
  if (!q) return [];
  const taken = new Set(selected.map((d) => d.id));
  return catalog
    .filter((d) => !taken.has(d.id) && (normalize(d.city).includes(q) || normalize(d.country).includes(q)))
    .slice(0, MAX_SUGGESTIONS);
}

export function addDestination(list: readonly Destination[], dest: Destination): Destination[] {
  if (list.length >= MAX_DESTINATIONS || list.some((d) => d.id === dest.id)) return [...list];
  return [...list, dest];
}

export function removeDestination(list: readonly Destination[], id: string): Destination[] {
  return list.filter((d) => d.id !== id);
}

/** Move o item de `from` para `to` (índices fora do intervalo não alteram a lista). */
export function moveDestination(list: readonly Destination[], from: number, to: number): Destination[] {
  const out = [...list];
  if (from === to || from < 0 || to < 0 || from >= out.length || to >= out.length) return out;
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item!);
  return out;
}

export function destinationsLabel(count: number): string {
  if (count === 0) return 'Nenhum destino selecionado';
  return count === 1 ? '1 destino selecionado' : `${count} destinos selecionados`;
}

export function canAdvance(origin: string, destinations: readonly Destination[]): boolean {
  return origin.trim().length > 0 && destinations.length > 0;
}

/** Posição de destino ao arrastar: a partir de `from`, deslocado `dy` px, com linhas de altura `pitch`; sempre dentro da lista. */
export function reorderTarget(from: number, dy: number, pitch: number, count: number): number {
  if (count <= 0 || pitch <= 0 || !Number.isFinite(dy)) return Math.max(0, Math.min(from, count - 1));
  return Math.max(0, Math.min(count - 1, from + Math.round(dy / pitch)));
}

/** Quanto (em linhas, -1/0/+1) o item `i` deve se afastar enquanto `from` é arrastado sobre `over`. */
export function shiftFor(i: number, from: number, over: number): -1 | 0 | 1 {
  if (i === from) return 0;
  if (from < over && i > from && i <= over) return -1;
  if (from > over && i < from && i >= over) return 1;
  return 0;
}
