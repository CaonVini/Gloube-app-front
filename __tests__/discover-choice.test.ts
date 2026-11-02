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

import { periodNote } from '../src/domain/discover/choice';
import { findBudget, NO_LIMIT_BAND } from '../src/domain/discover/budget';
import { isMonthYearValid } from '../src/domain/discover/dates';
import { emptyAnswers as _emptyAnswers, isStepComplete as _isStepComplete, visibleSteps as _visibleSteps } from '../src/domain/discover/quiz';

describe('datas e orçamento indefinidos', () => {
  const T = new Date(2026, 10, 1);
  it('mês/ano: válido só a partir do mês atual', () => {
    expect(isMonthYearValid(11, 2026, T)).toBe(true);
    expect(isMonthYearValid(10, 2026, T)).toBe(false);
    expect(isMonthYearValid(1, 2027, T)).toBe(true);
    expect(isMonthYearValid(13, 2027, T)).toBe(false);
    expect(isMonthYearValid(null, 2027, T)).toBe(false);
  });
  it('"Ainda não defini" orçamento é válido e sem teto', () => {
    expect(findBudget('indefinido')).toBe(NO_LIMIT_BAND);
    expect(_isStepComplete('orcamento', { ..._emptyAnswers(), budget: 'indefinido' }, T)).toBe(true);
  });
  it('passo de dias aparece para mês/ano e indefinido, não para datas exatas', () => {
    const a = _emptyAnswers();
    expect(_visibleSteps({ ...a, period: { mode: 'mes', month: 7, year: 2027 } }).some((s) => s.id === 'dias')).toBe(true);
    expect(_visibleSteps({ ...a, period: { mode: 'indefinido' } }).some((s) => s.id === 'dias')).toBe(true);
    expect(_visibleSteps({ ...a, period: { mode: 'definidas', startDate: '01/12/2026', endDate: '08/12/2026' } }).some((s) => s.id === 'dias')).toBe(false);
  });
  it('roteiro avisa quando não há datas exatas', () => {
    expect(periodNote({ mode: 'definidas', startDate: '01/12/2026', endDate: '08/12/2026' })).toBeNull();
    expect(periodNote({ mode: 'mes', month: 7, year: 2027 })).toContain('julho de 2027');
    expect(periodNote({ mode: 'indefinido' })).toContain('Sem datas definidas');
  });
});

import { likedByMatch, matchPercent } from '../src/domain/discover/match';
import { DESTINATIONS as _DEST } from '../src/domain/discover/catalog';
import type { Recommendation as _Rec } from '../src/domain/discover/types';

describe('% de match', () => {
  const mk = (id: string, cost = 3000): _Rec => ({ destination: _DEST.find((d) => d.id === id)!, score: 1, estimatedCost: cost, transportCost: 500, why: 'x', care: [] });
  const base = { ..._emptyAnswers(), climate: 'frio' as const, experiences: ['neve' as const, 'montanha' as const], companion: 'casal' as const, budget: '5k-10k' as const, days: 6 };
  it('100% quando todos os critérios batem', () => {
    const r = mk('bariloche', 6000);
    expect(matchPercent(r, { ...base, experiences: ['neve'] }).percent).toBe(100);
  });
  it('é transparente: mostra os critérios e fica entre 0 e 100', () => {
    const m = matchPercent(mk('maldivas', 20000), base);
    expect(m.percent).toBeGreaterThanOrEqual(0);
    expect(m.percent).toBeLessThan(100);
    expect(m.criteria.map((c) => c.id)).toEqual(['experiencias', 'clima', 'companhia', 'orcamento', 'duracao']);
  });
  it('"Ainda não defini" tira o orçamento da conta; sem respostas o critério não pesa', () => {
    const m = matchPercent(mk('bariloche', 99999), { ...base, budget: 'indefinido' });
    expect(m.criteria.some((c) => c.id === 'orcamento')).toBe(false);
    expect(matchPercent(mk('bariloche'), { ...base, experiences: [] }).criteria.some((c) => c.id === 'experiencias')).toBe(false);
  });
  it('lista só os curtidos, do maior para o menor match', () => {
    const recs = [mk('maldivas', 20000), mk('bariloche', 6000), mk('gramado', 4000)];
    const out = likedByMatch(recs, new Set(['maldivas', 'bariloche']), base);
    expect(out.map((x) => x.rec.destination.id)).toEqual(['bariloche', 'maldivas']);
    expect(out[0]!.match.percent).toBeGreaterThanOrEqual(out[1]!.match.percent);
    expect(likedByMatch(recs, new Set(), base)).toEqual([]);
  });
});
