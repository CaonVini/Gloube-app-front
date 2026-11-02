import { normalize } from '../trip-plan';
import { joinNames } from '../discover/places';
import type { ChatMessage } from './messages';

/** O que a Aurora "sabe" da viagem em andamento (vem do fluxo Planeje/Descubra, em memória). */
export interface TripContext {
  destinations: readonly string[];
  places: readonly string[];
}
export const EMPTY_TRIP: TripContext = { destinations: [], places: [] };

export const QUICK_SUGGESTIONS = [
  'Monte meu roteiro',
  'Quais locais eu escolhi?',
  'Quanto tempo ficar?',
  'Dicas de comida local',
] as const;

const GREETING = 'Oi! Eu sou a Aurora, sua parceira de viagem. Posso ajudar com roteiro, locais e dicas. Por onde começamos?';

function tripSummary(t: TripContext): string | null {
  if (t.destinations.length === 0) return null;
  return t.destinations.length === 1 ? t.destinations[0]! : joinNames(t.destinations);
}

function has(q: string, words: readonly string[]): boolean {
  return words.some((w) => q.includes(w));
}

/**
 * Resposta FICTÍCIA (regras simples por palavra-chave, sem IA nem rede). Usa o destino e os locais já escolhidos
 * quando existem. Para fotos e áudios, avisa com honestidade que a demonstração ainda não analisa o conteúdo.
 */
export function buildReply(msg: ChatMessage, trip: TripContext = EMPTY_TRIP): string {
  if (msg.kind === 'image') {
    return 'Recebi sua foto! Nesta demonstração eu ainda não analiso imagens, mas me conta o que ela tem de especial e eu encaixo no roteiro.';
  }
  if (msg.kind === 'audio') {
    return 'Recebi seu áudio! Nesta demonstração eu ainda não transcrevo áudios. Pode resumir por texto o que você precisa?';
  }
  const q = normalize(msg.text);
  const where = tripSummary(trip);
  const places = trip.places.slice(0, 3);

  if (has(q, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai']) && q.length <= 14) return GREETING;
  if (has(q, ['local', 'locais', 'escolhi', 'curti', 'gostei'])) {
    if (places.length === 0) return 'Você ainda não escolheu locais. Passe pela aba Planeje e curta alguns lugares que eu monto o roteiro em volta deles.';
    return `Você escolheu ${joinNames(places)}${trip.places.length > 3 ? ` e mais ${trip.places.length - 3}` : ''}. Quer que eu distribua isso pelos dias?`;
  }
  if (has(q, ['roteiro', 'itinerario', 'dia a dia', 'monte', 'montar'])) {
    if (!where) return 'Ainda não sei seu destino. Comece pela aba Planeje, escolha para onde quer ir e eu monto um roteiro com você.';
    return places.length > 0
      ? `Para ${where}, eu começaria por ${joinNames(places)}, deixando um respiro entre os passeios. Quer ver o resumo dia a dia?`
      : `Para ${where}, posso sugerir um roteiro leve. Escolha alguns locais na aba Planeje e eu organizo por dia.`;
  }
  if (has(q, ['quanto tempo', 'quantos dias', 'duracao', 'ficar'])) {
    return where ? `Em ${where}, de 4 a 6 dias costuma dar para curtir sem correria. Isso é só uma sugestão, ok?` : 'De 4 a 6 dias costuma ser um bom ritmo para a maioria dos destinos. Qual é o seu?';
  }
  if (has(q, ['comida', 'comer', 'restaurante', 'gastronomia', 'sabor'])) {
    return where ? `Em ${where}, vale provar a cozinha local em mercados e restaurantes pequenos. Confirme horários e reservas antes de ir.` : 'Me diz o destino e eu sugiro o que provar por lá.';
  }
  if (has(q, ['hotel', 'hospedagem', 'dormir', 'airbnb'])) {
    return 'Para hospedagem, prefira ficar perto dos locais que você escolheu para gastar menos tempo no trânsito. Confirme preços e disponibilidade antes de reservar.';
  }
  if (has(q, ['clima', 'tempo', 'chuva', 'frio', 'calor'])) {
    return 'O clima muda bastante com a época. Se me disser o mês da viagem, eu ajusto as dicas. Confira a previsão perto da data.';
  }
  if (has(q, ['orcamento', 'preco', 'custa', 'dinheiro', 'gasto'])) {
    return 'Os valores aqui são ilustrativos. Defina um teto por pessoa na aba Planeje que eu uso como referência nas sugestões.';
  }
  if (has(q, ['obrigad', 'valeu', 'show', 'otimo'])) return 'Por nada! Estou aqui para o que precisar na viagem.';
  return where
    ? `Anotado! Sobre ${where}, posso ajudar com roteiro, locais, comida ou hospedagem. O que prefere ver agora?`
    : 'Posso ajudar com roteiro, locais, comida ou hospedagem. Me conta mais sobre a viagem que você imagina.';
}

/** Tempo de "digitando…" proporcional à resposta, entre 0,8 s e 2 s (determinístico, fácil de testar). */
export function typingDelay(reply: string): number {
  return Math.min(2000, Math.max(800, 500 + reply.length * 8));
}
