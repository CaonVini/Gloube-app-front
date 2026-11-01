import { DESTINATIONS } from '../src/domain/discover/catalog';
import { buildDirectPreview, buildItineraryPreview } from '../src/domain/discover/choice';
import { PLACES, distributePlaces, placesFor, selectedPlaces, suggestedDays, togglePlace, MAX_PLACES_PER_DESTINATION } from '../src/domain/discover/places';
import { emptyAnswers } from '../src/domain/discover/quiz';
import { DESTINATION_CATALOG } from '../src/domain/trip-plan';

describe('catálogo de locais', () => {
  it('todo destino (Descubra e Nova viagem) tem várias opções de locais', () => {
    for (const d of DESTINATIONS) expect(placesFor(d.id).length).toBeGreaterThanOrEqual(5);
    for (const d of DESTINATION_CATALOG) expect(placesFor(d.id).length).toBeGreaterThanOrEqual(5);
  });
  it('ids são únicos e prefixados pelo destino; destino desconhecido não tem locais', () => {
    const all = Object.entries(PLACES).flatMap(([dest, ps]) => ps.map((p) => ({ dest, id: p.id })));
    expect(new Set(all.map((x) => x.id)).size).toBe(all.length);
    for (const x of all) expect(x.id.startsWith(`${x.dest}:`)).toBe(true);
    expect(placesFor('inexistente')).toEqual([]);
  });
  it('Paris traz a Torre Eiffel', () => {
    expect(placesFor('paris').map((p) => p.name)).toContain('Torre Eiffel');
  });
  it('não promete horários, preços, pets ou acessibilidade', () => {
    const text = Object.values(PLACES).flat().map((p) => p.blurb).join(' ').toLowerCase();
    expect(text).not.toMatch(/r\$|€|\bgrátis|gratuit|\d{1,2}h|aberto|acessível|pets?\b/);
  });
});

describe('seleção de locais', () => {
  it('alterna sem mutar e respeita o teto', () => {
    const base: readonly string[] = ['a'];
    expect(togglePlace(base, 'b')).toEqual(['a', 'b']);
    expect(togglePlace(['a', 'b'], 'a')).toEqual(['b']);
    expect(base).toEqual(['a']);
    const full = Array.from({ length: MAX_PLACES_PER_DESTINATION }, (_, i) => `x${i}`);
    expect(togglePlace(full, 'novo')).toEqual(full);
  });
  it('selectedPlaces mantém a ordem do catálogo e ignora ids desconhecidos', () => {
    const [p0, p1] = placesFor('paris');
    expect(selectedPlaces('paris', [p1!.id, 'zzz', p0!.id]).map((p) => p.id)).toEqual([p0!.id, p1!.id]);
  });
});

describe('roteiro baseado nos locais', () => {
  it('distribui nos dias do meio, preservando todos os locais', () => {
    const ps = placesFor('paris');
    const d = distributePlaces(ps, 5);
    expect(d[0]).toEqual([]);
    expect(d[4]).toEqual([]);
    expect(d.flat().map((p) => p.id)).toEqual(ps.map((p) => p.id));
    expect(distributePlaces(ps, 1)[0]).toHaveLength(ps.length);
    expect(distributePlaces([], 3).flat()).toEqual([]);
  });
  it('sugere dias entre 3 e 10', () => {
    expect(suggestedDays(0)).toBe(3);
    expect(suggestedDays(6)).toBe(5);
    expect(suggestedDays(99)).toBe(10);
  });
  it('prévia direta usa os locais escolhidos; sem locais cai em sugestão geral', () => {
    const chosen = selectedPlaces('paris', [placesFor('paris')[0]!.id, placesFor('paris')[1]!.id]);
    const pv = buildDirectPreview('Paris', chosen);
    const text = pv.days.flatMap((d) => d.items).join('|');
    expect(text).toContain('Torre Eiffel');
    expect(text).toContain('Louvre');
    expect(pv.notes.join(' ')).toContain('locais que você escolheu');
    const none = buildDirectPreview('Paris', []);
    expect(none.notes.join(' ')).toContain('não escolheu locais');
    expect(none.days).toHaveLength(3);
  });
  it('distribui nos dias do meio, preservando todos os locais', () => {
    const ps = placesFor('paris');
    const d = distributePlaces(ps, 5);
    expect(d[0]).toEqual([]);
    expect(d[4]).toEqual([]);
    expect(d.flat().map((p) => p.id)).toEqual(ps.map((p) => p.id));
    expect(distributePlaces(ps, 1)[0]).toHaveLength(ps.length);
    expect(distributePlaces([], 3).flat()).toEqual([]);
  });
  it('sugere dias entre 3 e 10', () => {
    expect(suggestedDays(0)).toBe(3);
    expect(suggestedDays(6)).toBe(5);
    expect(suggestedDays(99)).toBe(10);
  });
  it('prévia direta usa os locais escolhidos; sem locais cai em sugestão geral', () => {
    const chosen = selectedPlaces('paris', [placesFor('paris')[0]!.id, placesFor('paris')[1]!.id]);
    const pv = buildDirectPreview('Paris', chosen);
    const text = pv.days.flatMap((d) => d.items).join('|');
    expect(text).toContain('Torre Eiffel');
    expect(text).toContain('Louvre');
    expect(pv.notes.join(' ')).toContain('locais que você escolheu');
    const none = buildDirectPreview('Paris', []);
    expect(none.notes.join(' ')).toContain('não escolheu locais');
    expect(none.days).toHaveLength(3);
  });
  it('prévia do Descubra respeita os dias das respostas e inclui os locais', () => {
    const a = { ...emptyAnswers(), days: 6 };
    const rec = { destination: DESTINATIONS.find((d) => d.id === 'bariloche')!, score: 1, estimatedCost: 5000, transportCost: 1000, why: 'x', care: [] };
    const ps = placesFor(rec.destination.id).slice(0, 2);
    const pv = buildItineraryPreview(rec, a, ps);
    expect(pv.days).toHaveLength(6);
    expect(pv.days.flatMap((d) => d.items).join('|')).toContain(ps[0]!.name);
  });
});
