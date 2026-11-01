import { DEFAULT_ORIGIN_ID, resolveOrigin } from '../src/domain/discover/geo';
import { DEFAULT_DAYS, MAX_DAYS, MIN_DAYS, STEPS, clampDays, emptyAnswers, isStepComplete, monthOfPeriod, progressFraction, toggle } from '../src/domain/discover/quiz';

const TODAY = new Date(2026, 9, 31);

describe('quiz', () => {
  it('ordem das etapas segue o roteiro (clima → orçamento, sem a etapa de origem) com ids únicos', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['clima', 'experiencias', 'alcance', 'companhia', 'cuidados', 'periodo', 'dias', 'orcamento']);
    expect(new Set(STEPS.map((s) => s.id)).size).toBe(STEPS.length);
  });
  it('só experiências e cuidados são puláveis', () => {
    expect(STEPS.filter((s) => s.optional).map((s) => s.id)).toEqual(['experiencias', 'cuidados']);
  });
  it('toggle adiciona e remove sem mutar', () => {
    const a = ['praia'] as const;
    expect(toggle(a, 'neve' as never)).toEqual(['praia', 'neve']);
    expect(toggle(['praia', 'neve'], 'praia')).toEqual(['neve']);
    expect(a).toEqual(['praia']);
  });
  it('etapas obrigatórias só completam com resposta válida', () => {
    const a = emptyAnswers();
    expect(isStepComplete('clima', a, TODAY)).toBe(false);
    expect(isStepComplete('experiencias', a, TODAY)).toBe(true);
    expect(isStepComplete('dias', a, TODAY)).toBe(true);
    expect(isStepComplete('orcamento', a, TODAY)).toBe(false);
    expect(isStepComplete('clima', { ...a, climate: 'tanto-faz' }, TODAY)).toBe(true);
  });
  it('período: "Ainda não sei", mês e data válida completam; data inválida/passada, não', () => {
    const a = emptyAnswers();
    expect(isStepComplete('periodo', a, TODAY)).toBe(false);
    expect(isStepComplete('periodo', { ...a, period: { mode: 'indefinido' } }, TODAY)).toBe(true);
    expect(isStepComplete('periodo', { ...a, period: { mode: 'mes', month: null } }, TODAY)).toBe(false);
    expect(isStepComplete('periodo', { ...a, period: { mode: 'mes', month: 7 } }, TODAY)).toBe(true);
    expect(isStepComplete('periodo', { ...a, period: { mode: 'definidas', startDate: '10/01/2027' } }, TODAY)).toBe(true);
    expect(isStepComplete('periodo', { ...a, period: { mode: 'definidas', startDate: '10/01/2020' } }, TODAY)).toBe(false);
    expect(monthOfPeriod({ ...a, period: { mode: 'definidas', startDate: '10/01/2027' } }, TODAY)).toBe(1);
    expect(monthOfPeriod({ ...a, period: { mode: 'indefinido' } }, TODAY)).toBeNull();
  });
  it('clampDays limita entre 1 e 30 e trata valores inválidos', () => {
    expect(clampDays(0)).toBe(MIN_DAYS);
    expect(clampDays(99)).toBe(MAX_DAYS);
    expect(clampDays(NaN)).toBe(DEFAULT_DAYS);
    expect(clampDays(6.6)).toBe(7);
  });
  it('progresso vai de 1/8 a 100%', () => {
    expect(progressFraction(0)).toBeCloseTo(1 / 8);
    expect(progressFraction(STEPS.length - 1)).toBe(1);
    expect(progressFraction(99)).toBe(1);
    expect(progressFraction(-3)).toBe(0);
  });
});

describe('origem vinda da tela Nova viagem', () => {
  it('reconhece a cidade digitada ou a localização simulada', () => {
    expect(resolveOrigin('São Paulo, Brasil')).toEqual({ id: 'sao-paulo', assumed: false });
    expect(resolveOrigin('  porto alegre ')).toEqual({ id: 'porto-alegre', assumed: false });
    expect(resolveOrigin('BRASILIA')).toEqual({ id: 'brasilia', assumed: false });
  });
  it('sem texto ou sem correspondência usa a origem padrão e marca como assumida', () => {
    expect(resolveOrigin('')).toEqual({ id: DEFAULT_ORIGIN_ID, assumed: true });
    expect(resolveOrigin(undefined)).toEqual({ id: DEFAULT_ORIGIN_ID, assumed: true });
    expect(resolveOrigin('Cidade Inexistente')).toEqual({ id: DEFAULT_ORIGIN_ID, assumed: true });
  });
  it('emptyAnswers já nasce com a origem resolvida', () => {
    expect(emptyAnswers('Recife').origin).toBe('recife');
    expect(emptyAnswers().originAssumed).toBe(true);
  });
});
