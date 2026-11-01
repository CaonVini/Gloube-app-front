import { DESTINATIONS } from '../src/domain/discover/catalog';
import { buildComparison, comparisonHighlights, pickFavorites } from '../src/domain/discover/compare';
import { formatBRL } from '../src/domain/discover/budget';
import { maskDate, parseBrDate } from '../src/domain/discover/dates';
import { distanceKm, transportCost } from '../src/domain/discover/geo';
import { careNotes, isReadyToRank, passesHardFilters, recommend } from '../src/domain/discover/matching';
import type { Answers, Destination } from '../src/domain/discover/types';
import { emptyAnswers } from '../src/domain/discover/quiz';

const TODAY = new Date(2026, 9, 31);

function answers(over: Partial<Answers> = {}): Answers {
  return {
    ...emptyAnswers(),
    climate: 'calor', experiences: ['praia'], reach: 'internacional', origin: 'sao-paulo',
    companion: 'casal', originAssumed: false, period: { mode: 'indefinido' }, days: 10, budget: 'custom', customBudget: 1_000_000,
    ...over,
  };
}
const ids = (a: Answers) => recommend(a, DESTINATIONS, TODAY).map((r) => r.destination.id);
const dest = (id: string): Destination => DESTINATIONS.find((d) => d.id === id)!;

describe('catálogo', () => {
  it('tem ids únicos e dados coerentes', () => {
    expect(new Set(DESTINATIONS.map((d) => d.id)).size).toBe(DESTINATIONS.length);
    for (const d of DESTINATIONS) {
      expect(d.minDays).toBeGreaterThan(0);
      expect(d.dailyCost).toBeGreaterThan(0);
      expect(d.experiences.length).toBeGreaterThan(0);
    }
  });
});

describe('recommend', () => {
  it('não recomenda nada sem respostas obrigatórias', () => {
    expect(isReadyToRank(emptyAnswers())).toBe(false);
    expect(recommend(emptyAnswers(), DESTINATIONS, TODAY)).toEqual([]);
  });

  it('exemplo do mockup: praia + calor + casal traz Maldivas entre os primeiros, com explicação específica', () => {
    const r = recommend(answers(), DESTINATIONS, TODAY);
    expect(r.slice(0, 2).map((x) => x.destination.id)).toEqual(expect.arrayContaining(['maldivas']));
    const m = r.find((x) => x.destination.id === 'maldivas')!;
    expect(m.why).toContain('Você escolheu praia, calor e uma viagem a dois.');
    expect(m.why).toContain('Saindo de São Paulo');
    const assumed = recommend(answers({ originAssumed: true }), DESTINATIONS, TODAY).find((x) => x.destination.id === 'maldivas')!;
    expect(assumed.why).toContain('Sem origem informada, estimamos a partir de São Paulo');
    const idsR = r.map((x) => x.destination.id);
    expect(idsR.indexOf('maldivas')).toBeLessThan(idsR.indexOf('lisboa'));
  });

  it('respeita o alcance: internacional exclui destinos nacionais e vice-versa', () => {
    expect(recommend(answers({ reach: 'internacional' }), DESTINATIONS, TODAY).every((r) => !r.destination.domestic)).toBe(true);
    expect(recommend(answers({ reach: 'brasil' }), DESTINATIONS, TODAY).every((r) => r.destination.domestic)).toBe(true);
  });

  it('"perto de casa" só traz destinos nacionais a até 1000 km da origem', () => {
    const r = recommend(answers({ reach: 'perto', climate: 'tanto-faz', experiences: [], days: 5, budget: 'custom', customBudget: 1_000_000 }), DESTINATIONS, TODAY);
    expect(r.length).toBeGreaterThan(0);
    for (const x of r) expect(distanceKm('sudeste', x.destination.zone)).toBeLessThanOrEqual(1000);
    expect(r.map((x) => x.destination.id)).not.toContain('noronha');
  });

  it('duração curta elimina destinos que exigem mais dias', () => {
    const a = answers({ reach: 'internacional', days: 3, budget: 'custom', customBudget: 1_000_000, climate: 'tanto-faz' });
    expect(ids(a)).toEqual([]);
    const b = answers({ reach: 'brasil', days: 2, budget: 'custom', customBudget: 1_000_000, climate: 'tanto-faz', experiences: ['montanha'] });
    expect(ids(b)).toEqual(['campos']);
  });

  it('orçamento baixo evita viagem inviável (Maldivas não cabe em "até R$ 2.000")', () => {
    const a = answers({ reach: 'internacional', budget: 'ate-2k', days: 6, climate: 'tanto-faz' });
    expect(ids(a)).toEqual([]);
    expect(ids(answers({ reach: 'brasil', budget: 'ate-2k', days: 3, climate: 'tanto-faz' }))).not.toContain('noronha');
  });

  it('a origem muda o custo: Gramado fica mais barato saindo de Porto Alegre do que de Manaus', () => {
    const g = (origin: string) => recommend(answers({ reach: 'brasil', origin, climate: 'frio', experiences: ['montanha'], days: 4, budget: 'custom', customBudget: 1_000_000 }), DESTINATIONS, TODAY)
      .find((r) => r.destination.id === 'gramado')!.estimatedCost;
    expect(g('porto-alegre')).toBeLessThan(g('manaus'));
  });

  it('clima oposto é eliminado: frio não recebe destinos de calor, calor não recebe frio', () => {
    expect(recommend(answers({ climate: 'frio', reach: 'brasil', budget: 'custom', customBudget: 1_000_000, days: 7 }), DESTINATIONS, TODAY).every((r) => r.destination.climate !== 'calor')).toBe(true);
    expect(recommend(answers({ climate: 'calor', reach: 'internacional' }), DESTINATIONS, TODAY).every((r) => r.destination.climate !== 'frio')).toBe(true);
  });

  it('multi-seleção: mais experiências em comum sobem no ranking', () => {
    const r = recommend(answers({ reach: 'brasil', climate: 'calor', experiences: ['praia', 'natureza'], budget: 'custom', customBudget: 1_000_000, days: 7 }), DESTINATIONS, TODAY);
    expect(r[0]?.destination.experiences).toEqual(expect.arrayContaining(['praia', 'natureza']));
  });

  it('devolve no máximo 10 resultados, em ordem determinística', () => {
    const a = answers({ reach: 'brasil', climate: 'tanto-faz', experiences: [], budget: 'custom', customBudget: 1_000_000, days: 10 });
    const first = ids(a);
    expect(first.length).toBeLessThanOrEqual(10);
    expect(ids(a)).toEqual(first);
    expect(recommend(a, DESTINATIONS, TODAY, 3)).toHaveLength(3);
  });

  it('melhor época dá bônus quando o mês escolhido está nos meses ideais', () => {
    const base = answers({ reach: 'brasil', climate: 'frio', experiences: ['montanha'], budget: 'custom', customBudget: 1_000_000, days: 4 });
    const inSeason = recommend({ ...base, period: { mode: 'mes', month: 7 } }, DESTINATIONS, TODAY).find((r) => r.destination.id === 'gramado')!;
    const offSeason = recommend({ ...base, period: { mode: 'mes', month: 3 } }, DESTINATIONS, TODAY).find((r) => r.destination.id === 'gramado')!;
    expect(inSeason.score).toBeGreaterThan(offSeason.score);
    expect(inSeason.why).toContain('Julho é uma boa época');
  });
});

describe('pets e acessibilidade (somente informação verificada)', () => {
  const base = answers({ reach: 'brasil', climate: 'frio', experiences: ['montanha'], budget: 'custom', customBudget: 1_000_000, days: 4 });

  it('destino sem verificação aparece com "confirme antes de reservar", nunca como "ideal para pets"', () => {
    const notes = careNotes(dest('jericoacoara'), ['pets', 'acessibilidade']);
    expect(notes).toHaveLength(2);
    for (const n of notes) {
      expect(n.tone).toBe('warn');
      expect(n.text).toMatch(/confirme antes de reservar/i);
    }
  });

  it('só marca como aceito quando verified=true e allowed=true', () => {
    const [n] = careNotes(dest('gramado'), ['pets']);
    expect(n?.tone).toBe('ok');
    expect(n?.text).toContain('verificada');
  });

  it('destino verificado como NÃO aceitando pets é eliminado quando a pessoa viaja com pet', () => {
    expect(passesHardFilters(dest('noronha'), answers({ reach: 'brasil', needs: ['pets'], budget: 'custom', customBudget: 1_000_000 }))).toBe(false);
    expect(passesHardFilters(dest('noronha'), answers({ reach: 'brasil', needs: [], budget: 'custom', customBudget: 1_000_000 }))).toBe(true);
  });

  it('sem a necessidade marcada, não mostra aviso nenhum', () => {
    expect(careNotes(dest('gramado'), [])).toEqual([]);
    expect(recommend(base, DESTINATIONS, TODAY).every((r) => r.care.length === 0)).toBe(true);
  });

  it('condições coexistem (crianças + idosos + pets + acessibilidade)', () => {
    const r = recommend({ ...base, needs: ['criancas', 'idosos', 'pets', 'acessibilidade'] }, DESTINATIONS, TODAY);
    expect(r.length).toBeGreaterThan(0);
    expect(r[0]?.care.map((c) => c.need)).toEqual(['pets', 'acessibilidade']);
  });
});

describe('geo/orçamento/datas', () => {
  it('passagem internacional custa mais que nacional e cresce com a distância', () => {
    expect(transportCost('sudeste', 'asia', false)).toBeGreaterThan(transportCost('sudeste', 'europa', false));
    expect(transportCost('sudeste', 'europa', false)).toBeGreaterThan(transportCost('sudeste', 'nordeste', true));
  });
  it('formatBRL agrupa milhares', () => {
    expect(formatBRL(5200)).toBe('R$ 5.200');
    expect(formatBRL(999.6)).toBe('R$ 1.000');
    expect(formatBRL(1234567)).toBe('R$ 1.234.567');
  });
  it('maskDate aplica DD/MM/AAAA e ignora lixo', () => {
    expect(maskDate('01022027')).toBe('01/02/2027');
    expect(maskDate('0a1-0')).toBe('01/0');
    expect(maskDate('0102202799')).toBe('01/02/2027');
  });
  it('parseBrDate valida calendário real e rejeita passado', () => {
    expect(parseBrDate('15/01/2027', TODAY)).toEqual({ day: 15, month: 1, year: 2027 });
    expect(parseBrDate('31/02/2027', TODAY)).toBeNull();
    expect(parseBrDate('29/02/2028', TODAY)).not.toBeNull();
    expect(parseBrDate('30/10/2026', TODAY)).toBeNull();
    expect(parseBrDate('31/10/2026', TODAY)).not.toBeNull(); // hoje vale
    expect(parseBrDate('1/1/2027', TODAY)).toBeNull();
  });
});

describe('comparação de favoritos', () => {
  const recs = recommend(answers({ reach: 'brasil', climate: 'tanto-faz', experiences: [], budget: 'custom', customBudget: 1_000_000, days: 7, needs: ['pets'] }), DESTINATIONS, TODAY);
  it('pickFavorites mantém a ordem do ranking e ignora ids desconhecidos', () => {
    const picked = pickFavorites(recs, new Set([recs[2]!.destination.id, recs[0]!.destination.id, 'nao-existe']));
    expect(picked.map((r) => r.destination.id)).toEqual([recs[0]!.destination.id, recs[2]!.destination.id]);
  });
  it('buildComparison gera uma coluna por favorito e não promete pets sem verificação', () => {
    const picked = recs.slice(0, 3);
    const rows = buildComparison(picked);
    for (const row of rows) expect(row.values).toHaveLength(3);
    const pets = rows.find((r) => r.label === 'Aceita pets')!;
    picked.forEach((r, i) => {
      if (!r.destination.pets.verified) expect(pets.values[i]).toBe('Confirme antes de reservar');
    });
  });
});

describe('comparisonHighlights', () => {
  it('marca o mais barato e o de menos dias; sem destaque com menos de 2 favoritos', () => {
    const recs = recommend(answers({ reach: 'brasil', climate: 'tanto-faz', experiences: [], budget: 'custom', customBudget: 1_000_000, days: 7 }), DESTINATIONS, TODAY);
    const two = [recs.find((r) => r.destination.id === 'noronha')!, recs.find((r) => r.destination.id === 'chapada')!];
    const h = comparisonHighlights(two);
    expect(h.cheapestId).toBe('chapada');
    expect(h.shortestId).toBe('chapada');
    expect(comparisonHighlights(two.slice(0, 1))).toEqual({ cheapestId: null, shortestId: null });
  });
});
