import { normalize } from '../trip-plan';
import { joinNames } from '../discover/places';
import type { ChatMessage } from './messages';

/** O que a Aurora sabe da viagem em andamento (só o destino, em memória) para personalizar as dúvidas. */
export interface TripContext {
  destinations: readonly string[];
  places: readonly string[];
}
export const EMPTY_TRIP: TripContext = { destinations: [], places: [] };

const GREETING = 'Oi! Eu sou a Aurora. Tire suas dúvidas sobre documentos, clima, moeda, transporte, segurança ou comida local. Sobre o que quer saber?';
const OFFICIAL = 'Confirme sempre em fontes oficiais antes de viajar.';

function has(q: string, words: readonly string[]): boolean {
  return words.some((w) => q.includes(w));
}

/** Palavras que indicam pedido de roteiro: a Aurora NÃO monta, só orienta. */
const ITINERARY_WORDS = ['roteiro', 'itinerario', 'dia a dia', 'monte', 'montar', 'monta ', 'organize', 'organizar', 'agenda'];

/**
 * Resposta FICTÍCIA por palavra-chave (sem IA nem rede). A Aurora só tira dúvidas gerais e usa o destino quando existe.
 * Não afirma preços, regras ou horários reais: sempre recomenda confirmar em fontes oficiais.
 * Foto e áudio: avisa com honestidade que a demonstração ainda não analisa o conteúdo.
 */
export function buildReply(msg: ChatMessage, trip: TripContext = EMPTY_TRIP): string {
  if (msg.kind === 'image') {
    return 'Recebi sua foto! Nesta demonstração eu ainda não analiso imagens, mas me conta por texto o que você quer saber sobre ela.';
  }
  if (msg.kind === 'audio') {
    return 'Recebi seu áudio! Nesta demonstração eu ainda não transcrevo áudios. Pode escrever sua dúvida em poucas palavras?';
  }
  const q = normalize(msg.text);
  const where = trip.destinations.length > 0 ? joinNames(trip.destinations) : null;
  const inWhere = where ? ` para ${where}` : '';

  if (has(q, ITINERARY_WORDS)) {
    return 'Eu ajudo só com dúvidas de viagem, não monto roteiros. Para organizar seus dias, use a aba Roteiro; e se surgir qualquer dúvida no caminho, é só me chamar.';
  }
  if (q.length <= 14 && has(q, ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'e ai'])) return GREETING;
  if (has(q, ['visto', 'documento', 'passaporte', 'identidade'])) {
    return `Documentos${inWhere}: leve passaporte válido (muitos países exigem validade de 6 meses) e verifique se há exigência de visto. ${OFFICIAL}`;
  }
  if (has(q, ['clima', 'tempo', 'chuva', 'frio', 'calor', 'temperatura', 'epoca'])) {
    return `O clima${where ? ` em ${where}` : ''} muda bastante com a estação. Pesquise a média do mês da viagem e confira a previsão alguns dias antes para escolher as roupas.`;
  }
  if (has(q, ['moeda', 'cambio', 'dinheiro', 'dolar', 'euro', 'cartao', 'saque'])) {
    return `Sobre dinheiro${inWhere}: veja qual é a moeda local, compare câmbio e taxas do cartão e leve uma reserva em espécie. Os valores variam, então consulte o seu banco antes de viajar.`;
  }
  if (has(q, ['transporte', 'locomo', 'metro', 'onibus', 'uber', 'taxi', 'aluguel de carro', 'carro', 'chegar', 'andar'])) {
    return `Para se locomover${where ? ` em ${where}` : ''}, transporte público e aplicativos costumam resolver bem nas cidades. Pesquise passes e bilhetes locais e confirme horários no site oficial.`;
  }
  if (has(q, ['seguro', 'seguranca', 'perigo', 'golpe', 'assalto', 'roubo'])) {
    return `Segurança${inWhere}: guarde cópias dos documentos, evite exibir objetos de valor, desconfie de ofertas muito boas e contrate um seguro-viagem. Veja os avisos oficiais do destino antes de ir.`;
  }
  if (has(q, ['comida', 'comer', 'restaurante', 'gastronomia', 'prato', 'bebida', 'alergia'])) {
    return `Na culinária${where ? ` de ${where}` : ''}, vale provar os pratos típicos em lugares frequentados por moradores. Se você tem alguma alergia ou restrição, avise sempre antes de pedir.`;
  }
  if (has(q, ['hotel', 'hospedagem', 'dormir', 'airbnb', 'ficar onde'])) {
    return 'Na hora de escolher onde ficar, pesquise a localização, as avaliações recentes e a política de cancelamento. Confirme preços e disponibilidade direto na reserva.';
  }
  if (has(q, ['vacina', 'saude', 'remedio', 'doenca', 'medico'])) {
    return `Saúde${inWhere}: veja se há vacinas recomendadas ou exigidas, leve seus remédios com receita e considere um seguro-viagem com cobertura médica. Em caso de dúvida, consulte um profissional de saúde.`;
  }
  if (has(q, ['mala', 'bagagem', 'levar', 'roupa', 'adaptador', 'tomada', 'chip', 'internet'])) {
    return 'Na mala, priorize roupas em camadas, documentos, carregador e adaptador de tomada. Veja o limite de bagagem da sua companhia aérea e como ter internet por lá (chip local ou eSIM).';
  }
  if (has(q, ['obrigad', 'valeu', 'show', 'otimo'])) return 'Por nada! Se tiver mais alguma dúvida, é só me chamar.';
  return where
    ? `Boa pergunta! Sobre ${where}, posso ajudar com documentos, clima, moeda, transporte, segurança e comida local. Qual desses você quer ver?`
    : 'Posso ajudar com documentos, clima, moeda, transporte, segurança e comida local. Qual é a sua dúvida?';
}

/** Tempo de "digitando…" proporcional à resposta, entre 0,8 s e 2 s (determinístico, fácil de testar). */
export function typingDelay(reply: string): number {
  return Math.min(2000, Math.max(800, 500 + reply.length * 8));
}
