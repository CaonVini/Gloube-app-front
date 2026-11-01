import { DESTINATIONS } from '../src/domain/discover/catalog';
import { buildItineraryPreview, firstSentence, orderForChoice } from '../src/domain/discover/choice';
import { emptyAnswers } from '../src/domain/discover/quiz';
import type { Recommendation } from '../src/domain/discover/types';

const rec = (id: string, why = 'Você escolheu praia. Cabe no orçamento.'): Recommendation => ({
  destination: DESTINATIONS.find((d) => d.id === id)!,
  score: 1, estimatedCost: 5000, transportCost: 1000, why, care: [],
});

describe('orderForChoice', () => {
  it('põe os favoritos primeiro, mantendo o ranking, e preserva todos os destinos', () => {
    const recs = [rec('maldivas'), rec('lisboa'), rec('rio'), rec('noronha')];
    const out = orderForChoice(recs, new Set(['noronha', 'lisboa']));
    expect(out.map((r) => r.destination.id)).toEqual(['lisboa', 'noronha', 'maldivas', 'rio']);
    expect(orderForChoice(recs, new Set())).toEqual(recs);
  });
});

describe('firstSentence', () => {
  it('devolve só a primeira frase', () => {
    expect(firstSentence('Você escolheu praia. Cabe no orçamento.')).toBe('Você escolheu praia.');
    expect(firstSentence('Sem ponto final')).toBe('Sem ponto final');
    expect(firstSentence('R$ 6.100 por pessoa. Ok.')).toBe('R$ 6.100 por pessoa.');
  });
});

describe('buildItineraryPreview', () => {
  const base = { ...emptyAnswers(), days: 5 };
  it('monta um dia por dia da viagem, com chegada e volta', () => {
    const p = buildItineraryPreview(rec('lisboa'), base);
    expect(p.title).toBe(`5 dias em ${rec('lisboa').destination.name}`);
    expect(p.days).toHaveLength(5);
    expect(p.days[0]!.title).toMatch(/Chegada/);
    expect(p.days[4]!.title).toMatch(/volta/);
    expect(p.days.every((d) => d.items.length >= 1)).toBe(true);
  });
  it('é determinística e funciona com 1 dia', () => {
    expect(buildItineraryPreview(rec('rio'), base)).toEqual(buildItineraryPreview(rec('rio'), base));
    expect(buildItineraryPreview(rec('rio'), { ...base, days: 1 }).days).toHaveLength(1);
  });
  it('nunca promete pets/acessibilidade: só pede para confirmar', () => {
    const p = buildItineraryPreview(rec('noronha'), { ...base, needs: ['pets', 'acessibilidade'] });
    const text = p.notes.join(' ');
    expect(text).toMatch(/Pets: confirme/);
    expect(text).toMatch(/Acessibilidade: confirme/);
    expect(text).not.toMatch(/aceita pets|totalmente acessível/i);
  });
});

import { applyReaction, nextCardIndex } from '../src/domain/discover/choice';

describe('reação aos cards (gostei / não gostei)', () => {
  it('gostei favorita sem mutar o original e é idempotente', () => {
    const base: ReadonlySet<string> = new Set(['a']);
    const withB = applyReaction(base, 'b', true);
    expect([...withB]).toEqual(['a', 'b']);
    expect([...base]).toEqual(['a']);
    expect(applyReaction(withB, 'b', true)).toBe(withB);
  });
  it('não gostei só avança: favoritos ficam iguais', () => {
    const base: ReadonlySet<string> = new Set(['a']);
    expect(applyReaction(base, 'b', false)).toBe(base);
  });
  it('avança até o último; depois sinaliza comparação', () => {
    expect(nextCardIndex(0, 3)).toBe(1);
    expect(nextCardIndex(1, 3)).toBe(2);
    expect(nextCardIndex(2, 3)).toBeNull();
    expect(nextCardIndex(0, 1)).toBeNull();
  });
});
