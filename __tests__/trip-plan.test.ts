import {
  DESTINATION_CATALOG, MAX_DESTINATIONS, addDestination, canAdvance, destinationsLabel, moveDestination, normalize,
  removeDestination, searchDestinations, type Destination,
} from '../src/domain/trip-plan';

const [paris, roma, lisboa] = DESTINATION_CATALOG as [Destination, Destination, Destination];

describe('searchDestinations', () => {
  it('busca vazia ou só espaços não sugere nada', () => {
    expect(searchDestinations('', [])).toEqual([]);
    expect(searchDestinations('   ', [])).toEqual([]);
  });
  it('ignora acentos, caixa e casa também pelo país', () => {
    expect(searchDestinations('amsterda', []).map((d) => d.id)).toEqual(['amsterda']);
    expect(searchDestinations('ESPANHA', []).map((d) => d.id)).toEqual(['madri', 'barcelona']);
  });
  it('não repete destinos já escolhidos e limita o número de sugestões', () => {
    expect(searchDestinations('paris', [paris])).toEqual([]);
    expect(searchDestinations('a', []).length).toBeLessThanOrEqual(5);
  });
});

describe('add/remove/move', () => {
  it('adiciona sem duplicar e respeita o limite', () => {
    expect(addDestination([paris], roma)).toEqual([paris, roma]);
    expect(addDestination([paris], paris)).toEqual([paris]);
    const full = DESTINATION_CATALOG.slice(0, MAX_DESTINATIONS);
    expect(addDestination(full, { id: 'x', city: 'X', country: 'Y' })).toHaveLength(MAX_DESTINATIONS);
  });
  it('remove por id sem mutar a lista original', () => {
    const list = [paris, roma];
    expect(removeDestination(list, 'paris')).toEqual([roma]);
    expect(list).toHaveLength(2);
  });
  it('reordena e ignora índices inválidos', () => {
    expect(moveDestination([paris, roma, lisboa], 2, 0)).toEqual([lisboa, paris, roma]);
    expect(moveDestination([paris, roma], 0, 1)).toEqual([roma, paris]);
    expect(moveDestination([paris, roma], 0, 5)).toEqual([paris, roma]);
    expect(moveDestination([paris, roma], -1, 0)).toEqual([paris, roma]);
  });
});

describe('textos e validação', () => {
  it('pluraliza o contador', () => {
    expect(destinationsLabel(0)).toBe('Nenhum destino selecionado');
    expect(destinationsLabel(1)).toBe('1 destino selecionado');
    expect(destinationsLabel(2)).toBe('2 destinos selecionados');
  });
  it('só avança com origem preenchida e ao menos um destino', () => {
    expect(canAdvance('São Paulo', [paris])).toBe(true);
    expect(canAdvance('  ', [paris])).toBe(false);
    expect(canAdvance('São Paulo', [])).toBe(false);
  });
  it('normalize remove acentos', () => expect(normalize(' Tóquio ')).toBe('toquio'));
});
