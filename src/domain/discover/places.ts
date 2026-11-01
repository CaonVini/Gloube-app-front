import type { Experience } from './types';

/**
 * Locais/atrações por destino. Catálogo FICTÍCIO/ilustrativo (sem API): só nomes conhecidos e uma frase neutra.
 * NÃO traz horários, preços, regras de pets ou acessibilidade: nada disso é afirmado sem dado verificado.
 */
export type PlaceKind = 'icone' | 'museu' | 'natureza' | 'passeio' | 'sabor' | 'bairro';

export interface Place {
  id: string;
  name: string;
  kind: PlaceKind;
  blurb: string;
}

export const KIND_LABEL: Record<PlaceKind, string> = {
  icone: 'ÍCONE', museu: 'CULTURA', natureza: 'NATUREZA', passeio: 'PASSEIO', sabor: 'SABORES', bairro: 'BAIRRO',
};

type Row = readonly [name: string, kind: PlaceKind, blurb: string];

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function list(dest: string, rows: readonly Row[]): readonly Place[] {
  return rows.map(([name, kind, blurb]) => ({ id: `${dest}:${slug(name)}`, name, kind, blurb }));
}

export const PLACES: Readonly<Record<string, readonly Place[]>> = {
  paris: list('paris', [
    ['Torre Eiffel', 'icone', 'O cartão-postal de Paris à beira do Sena.'],
    ['Museu do Louvre', 'museu', 'Um dos maiores museus de arte do mundo.'],
    ['Catedral de Notre-Dame', 'icone', 'Marco gótico na Île de la Cité.'],
    ['Montmartre e Sacré-Cœur', 'bairro', 'Ruas de colina, artistas e vista da cidade.'],
    ['Passeio de barco no Sena', 'passeio', 'A cidade vista da água.'],
    ['Jardim de Luxemburgo', 'natureza', 'Pausa verde no coração da cidade.'],
  ]),
  roma: list('roma', [
    ['Coliseu', 'icone', 'O anfiteatro símbolo da Roma antiga.'],
    ['Fórum Romano', 'museu', 'Ruínas do centro da vida pública romana.'],
    ['Fontana di Trevi', 'icone', 'A fonte barroca mais famosa da cidade.'],
    ['Vaticano e Basílica de São Pedro', 'museu', 'Arte e arquitetura em um só passeio.'],
    ['Trastevere', 'bairro', 'Vielas charmosas, trattorias e vida noturna.'],
    ['Panteão', 'icone', 'Templo antigo com cúpula de tirar o fôlego.'],
  ]),
  lisboa: list('lisboa', [
    ['Torre de Belém', 'icone', 'Marco manuelino à beira do Tejo.'],
    ['Mosteiro dos Jerónimos', 'museu', 'Joia da arquitetura portuguesa.'],
    ['Alfama', 'bairro', 'O bairro mais antigo, de becos e fado.'],
    ['Bonde 28', 'passeio', 'Um passeio clássico pelas colinas.'],
    ['Pastéis de Belém', 'sabor', 'Doce típico para provar no local.'],
    ['Miradouros de Lisboa', 'natureza', 'Vistas abertas sobre telhados e rio.'],
  ]),
  madri: list('madri', [
    ['Museu do Prado', 'museu', 'Grande acervo de pintura europeia.'],
    ['Palácio Real', 'icone', 'Residência oficial da monarquia espanhola.'],
    ['Parque do Retiro', 'natureza', 'Jardins e lago no centro da cidade.'],
    ['Plaza Mayor', 'icone', 'Praça histórica para um café sem pressa.'],
    ['Mercado de San Miguel', 'sabor', 'Petiscos e sabores espanhóis.'],
    ['Bairro de La Latina', 'bairro', 'Tapas e vida de rua.'],
  ]),
  barcelona: list('barcelona', [
    ['Sagrada Família', 'icone', 'A basílica inacabada de Gaudí.'],
    ['Parque Güell', 'natureza', 'Mosaicos e vista da cidade.'],
    ['Las Ramblas', 'passeio', 'Boulevard animado até o mar.'],
    ['Bairro Gótico', 'bairro', 'Ruas medievais e praças escondidas.'],
    ['Casa Batlló', 'museu', 'Arquitetura modernista de Gaudí.'],
    ['Praia da Barceloneta', 'natureza', 'Mar e tapas na orla.'],
  ]),
  londres: list('londres', [
    ['Big Ben e Westminster', 'icone', 'O símbolo da cidade junto ao Tâmisa.'],
    ['Museu Britânico', 'museu', 'Acervo de história e culturas do mundo.'],
    ['London Eye', 'passeio', 'A cidade vista do alto.'],
    ['Torre de Londres', 'icone', 'Fortaleza histórica à beira do rio.'],
    ['Hyde Park', 'natureza', 'Grande parque para caminhar.'],
    ['Borough Market', 'sabor', 'Mercado de comidas variadas.'],
  ]),
  amsterda: list('amsterda', [
    ['Museu Van Gogh', 'museu', 'Obras do artista holandês.'],
    ['Rijksmuseum', 'museu', 'Arte e história dos Países Baixos.'],
    ['Passeio pelos canais', 'passeio', 'A cidade em barco, entre pontes.'],
    ['Casa de Anne Frank', 'museu', 'Visita de memória e reflexão.'],
    ['Vondelpark', 'natureza', 'Parque tranquilo para pedalar.'],
    ['Bairro Jordaan', 'bairro', 'Cafés, galerias e ruas charmosas.'],
  ]),
  berlim: list('berlim', [
    ['Portão de Brandemburgo', 'icone', 'Monumento símbolo da cidade.'],
    ['Muro de Berlim (East Side Gallery)', 'museu', 'Trecho do muro com arte de rua.'],
    ['Ilha dos Museus', 'museu', 'Conjunto de museus em uma ilha do rio.'],
    ['Reichstag', 'icone', 'O parlamento alemão com cúpula de vidro.'],
    ['Tiergarten', 'natureza', 'Grande parque urbano.'],
    ['Kreuzberg', 'bairro', 'Cultura alternativa e culinária variada.'],
  ]),
  toquio: list('toquio', [
    ['Templo Sensō-ji (Asakusa)', 'icone', 'O templo mais antigo da cidade.'],
    ['Cruzamento de Shibuya', 'icone', 'Um dos cruzamentos mais movimentados do mundo.'],
    ['Parque Ueno', 'natureza', 'Parque com museus e lagoa.'],
    ['Mercado de Tsukiji', 'sabor', 'Frutos do mar e comida de rua.'],
    ['Santuário Meiji', 'natureza', 'Floresta tranquila no meio da cidade.'],
    ['Akihabara', 'bairro', 'Eletrônicos, jogos e cultura pop.'],
  ]),
  'nova-york': list('nova-york', [
    ['Central Park', 'natureza', 'O grande parque no coração de Manhattan.'],
    ['Estátua da Liberdade', 'icone', 'Marco na entrada do porto.'],
    ['Times Square', 'icone', 'Luzes e movimento a qualquer hora.'],
    ['Museu Metropolitano (MET)', 'museu', 'Um dos maiores museus de arte.'],
    ['Ponte do Brooklyn', 'passeio', 'Travessia a pé com vista do skyline.'],
    ['High Line', 'passeio', 'Parque elevado sobre antigos trilhos.'],
  ]),
  'buenos-aires': list('buenos-aires', [
    ['Casa Rosada e Plaza de Mayo', 'icone', 'O centro político e histórico.'],
    ['Bairro La Boca (Caminito)', 'bairro', 'Casas coloridas e cultura local.'],
    ['Recoleta', 'bairro', 'Cemitério histórico, cafés e feiras.'],
    ['Teatro Colón', 'museu', 'Uma das grandes casas de ópera.'],
    ['Show de tango', 'passeio', 'Música e dança típicas da cidade.'],
    ['Parrilla argentina', 'sabor', 'Churrasco tradicional.'],
  ]),
  santiago: list('santiago', [
    ['Cerro San Cristóbal', 'natureza', 'Mirante com vista de toda a cidade.'],
    ['Plaza de Armas', 'icone', 'O centro histórico da capital.'],
    ['Vale Nevado', 'natureza', 'Passeio na montanha perto da cidade.'],
    ['Mercado Central', 'sabor', 'Frutos do mar e culinária chilena.'],
    ['Museu de Belas Artes', 'museu', 'Arte chilena e internacional.'],
    ['Bairro Bellavista', 'bairro', 'Ruas boêmias, cafés e arte de rua.'],
  ]),
  maldivas: list('maldivas', [
    ['Snorkel no recife de corais', 'natureza', 'Mergulho raso entre peixes coloridos.'],
    ['Passeio de barco ao pôr do sol', 'passeio', 'Fim de tarde no oceano Índico.'],
    ['Ilha de Malé', 'bairro', 'A capital, para conhecer o dia a dia local.'],
    ['Dia de praia privativa', 'natureza', 'Areia clara e mar calmo.'],
    ['Jantar à beira-mar', 'sabor', 'Frutos do mar com os pés na areia.'],
    ['Passeio com golfinhos', 'passeio', 'Excursão de barco para ver a vida marinha.'],
  ]),
  noronha: list('noronha', [
    ['Baía do Sancho', 'natureza', 'Frequentemente listada entre as praias mais bonitas do Brasil.'],
    ['Praia do Leão', 'natureza', 'Dunas e vista para o mar na ilha.'],
    ['Mergulho em Noronha', 'passeio', 'Águas claras com muita vida marinha.'],
    ['Pôr do sol no Forte dos Remédios', 'icone', 'Fim de tarde com vista para o mar.'],
    ['Trilha do Atalaia', 'natureza', 'Piscinas naturais entre as pedras.'],
    ['Vila dos Remédios', 'bairro', 'O centro da ilha, com restaurantes e história.'],
  ]),
  gramado: list('gramado', [
    ['Lago Negro', 'natureza', 'Passeio tranquilo em meio ao verde.'],
    ['Rua Coberta', 'passeio', 'Calçadão charmoso do centro.'],
    ['Mini Mundo', 'passeio', 'Miniaturas de cidades e monumentos.'],
    ['Cafés coloniais', 'sabor', 'Mesa farta no estilo serrano.'],
    ['Canela e a Catedral de Pedra', 'icone', 'Cidade vizinha de arquitetura marcante.'],
    ['Chocolaterias de Gramado', 'sabor', 'Chocolate artesanal para provar.'],
  ]),
  jericoacoara: list('jericoacoara', [
    ['Pedra Furada', 'natureza', 'Formação rochosa sobre o mar.'],
    ['Duna do Pôr do Sol', 'natureza', 'O fim de tarde clássico da vila.'],
    ['Lagoa do Paraíso', 'natureza', 'Água calma para relaxar.'],
    ['Passeio de buggy', 'passeio', 'Percurso pelas dunas e lagoas.'],
    ['Vila de Jericoacoara', 'bairro', 'Ruas de areia, restaurantes e vida noturna.'],
    ['Kitesurf e windsurf', 'passeio', 'Esportes ligados ao vento da região.'],
  ]),
  bariloche: list('bariloche', [
    ['Cerro Catedral', 'natureza', 'Estação de esqui e vista das montanhas.'],
    ['Circuito Chico', 'passeio', 'Rota panorâmica entre lagos e mirantes.'],
    ['Cerro Campanário', 'natureza', 'Mirante com vista dos lagos.'],
    ['Centro Cívico', 'icone', 'Praça central com construções de pedra.'],
    ['Chocolaterias de Bariloche', 'sabor', 'Chocolate artesanal para provar.'],
    ['Lago Nahuel Huapi', 'natureza', 'O grande lago que cerca a cidade.'],
  ]),
  chapada: list('chapada', [
    ['Cachoeira da Fumaça', 'natureza', 'Queda-d’água alta, alcançada por trilha.'],
    ['Poço Azul', 'natureza', 'Poço de água azulada em caverna.'],
    ['Vale do Capão', 'natureza', 'Trilhas e vilarejo tranquilo.'],
    ['Morro do Pai Inácio', 'natureza', 'Mirante com vista aberta do vale.'],
    ['Lençóis', 'bairro', 'Cidade histórica, base para os passeios.'],
    ['Gruta da Lapa Doce', 'passeio', 'Visita guiada a uma caverna.'],
  ]),
  rio: list('rio', [
    ['Cristo Redentor', 'icone', 'O símbolo do Rio no alto do Corcovado.'],
    ['Pão de Açúcar', 'icone', 'Bondinho e vista da baía.'],
    ['Praia de Ipanema', 'natureza', 'Praia clássica ao pôr do sol.'],
    ['Escadaria Selarón', 'icone', 'Degraus coloridos entre Lapa e Santa Teresa.'],
    ['Jardim Botânico', 'natureza', 'Passeio tranquilo entre palmeiras.'],
    ['Santa Teresa', 'bairro', 'Ruas históricas, ateliês e bares.'],
  ]),
  cancun: list('cancun', [
    ['Praias da Zona Hoteleira', 'natureza', 'Mar do Caribe e areia branca.'],
    ['Isla Mujeres', 'passeio', 'Passeio de barco até a ilha.'],
    ['Chichén Itzá', 'museu', 'Sítio arqueológico maia, em passeio de dia inteiro.'],
    ['Cenotes da região', 'natureza', 'Poços naturais de água cristalina.'],
    ['Snorkel no recife', 'passeio', 'Mergulho raso no Caribe.'],
    ['Centro de Cancún', 'bairro', 'Mercados e comida mexicana local.'],
  ]),
  campos: list('campos', [
    ['Pedra do Baú', 'natureza', 'Trilha com vista ampla da serra.'],
    ['Capivari', 'bairro', 'Centro com lojas, cafés e restaurantes.'],
    ['Horto Florestal', 'natureza', 'Caminhadas e áreas verdes.'],
    ['Teleférico de Campos do Jordão', 'passeio', 'Passeio com vista para a serra.'],
    ['Palácio Boa Vista', 'museu', 'Residência histórica da região.'],
    ['Fondue na serra', 'sabor', 'Cardápio típico para dias frios.'],
  ]),
  bonito: list('bonito', [
    ['Gruta do Lago Azul', 'natureza', 'Caverna com lago de água azul.'],
    ['Rio Sucuri (flutuação)', 'passeio', 'Flutuação em águas muito claras.'],
    ['Balneário Municipal', 'natureza', 'Rio calmo para nadar.'],
    ['Buraco das Araras', 'natureza', 'Dolina com aves e mirante.'],
    ['Aquário Natural', 'passeio', 'Flutuação com vida aquática.'],
    ['Cachoeiras do Rio do Peixe', 'natureza', 'Quedas em meio à mata.'],
  ]),
};

export const MAX_PLACES_PER_DESTINATION = 12;

export function placesFor(destinationId: string): readonly Place[] {
  return PLACES[destinationId] ?? [];
}

/** Alterna um local na seleção (sem mutar). Respeita o teto por destino. */
export function togglePlace(selected: readonly string[], placeId: string): string[] {
  if (selected.includes(placeId)) return selected.filter((id) => id !== placeId);
  if (selected.length >= MAX_PLACES_PER_DESTINATION) return [...selected];
  return [...selected, placeId];
}

/** Locais escolhidos, na ordem do catálogo; ids desconhecidos são ignorados. */
export function selectedPlaces(destinationId: string, selected: readonly string[]): Place[] {
  return placesFor(destinationId).filter((p) => selected.includes(p.id));
}

/** Dias sugeridos quando as datas ainda não foram definidas: ~2 locais por dia + chegada e volta (3 a 10). */
export function suggestedDays(placeCount: number): number {
  return Math.max(3, Math.min(10, Math.ceil(placeCount / 2) + 2));
}

/** Estilos de fallback para dias sem local escolhido. */
export const FALLBACK_EXPERIENCE: Experience = 'cidade';

/**
 * Distribui os locais escolhidos pelos dias do meio (chegada e volta ficam livres).
 * Com 1 dia só, tudo vai nele. Devolve uma lista por dia (índice 0 = dia 1).
 */
export function distributePlaces(places: readonly Place[], totalDays: number): Place[][] {
  const days = Math.max(1, totalDays);
  const out: Place[][] = Array.from({ length: days }, () => []);
  if (places.length === 0) return out;
  const slots = days === 1 ? [0] : days === 2 ? [0, 1] : Array.from({ length: days - 2 }, (_, i) => i + 1);
  places.forEach((p, i) => out[slots[Math.floor((i * slots.length) / places.length)]!]!.push(p));
  return out;
}

/** "Gostei": inclui o local (idempotente, respeita o teto). "Não gostei" não chama nada. */
export function addPlace(selected: readonly string[], placeId: string): string[] {
  if (selected.includes(placeId) || selected.length >= MAX_PLACES_PER_DESTINATION) return [...selected];
  return [...selected, placeId];
}
