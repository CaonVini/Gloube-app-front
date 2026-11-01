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

import { monthGrid, nightsBetween, pickRangeDate, shortLabel, toBr } from '../src/domain/discover/dates';

describe('calendário de ida e volta', () => {
  it('formata e conta noites', () => {
    expect(toBr(2026, 12, 5)).toBe('05/12/2026');
    expect(shortLabel('12/12/2026')).toBe('12 dez');
    expect(shortLabel('31/02/2026')).toBe('');
    expect(nightsBetween('12/12/2026', '17/12/2026')).toBe(5);
    expect(nightsBetween('28/12/2026', '02/01/2027')).toBe(5);
    expect(nightsBetween('17/12/2026', '12/12/2026')).toBeNull();
    expect(nightsBetween('12/12/2026', undefined)).toBeNull();
  });
  it('monta a grade de 6 semanas começando na segunda', () => {
    const g = monthGrid(2026, 12); // 1º/12/2026 é terça
    expect(g).toHaveLength(42);
    expect(g[0]).toBeNull();
    expect(g[1]).toBe(1);
    expect(g.filter((d) => d !== null)).toHaveLength(31);
  });
  it('seleciona o intervalo em dois toques e recomeça no terceiro', () => {
    expect(pickRangeDate('', '', '12/12/2026')).toEqual({ start: '12/12/2026', end: '' });
    expect(pickRangeDate('12/12/2026', '', '17/12/2026')).toEqual({ start: '12/12/2026', end: '17/12/2026' });
    expect(pickRangeDate('12/12/2026', '', '10/12/2026')).toEqual({ start: '10/12/2026', end: '' });
    expect(pickRangeDate('12/12/2026', '17/12/2026', '20/12/2026')).toEqual({ start: '20/12/2026', end: '' });
  });
});

import { defaultRange } from '../src/domain/discover/dates';
import { findBudget, parseMoneyInput } from '../src/domain/discover/budget';

describe('orçamento e datas padrão', () => {
  it('sugere ida em 30 dias e volta 7 noites depois (virando o ano)', () => {
    expect(defaultRange(new Date(2026, 9, 31))).toEqual({ start: '30/11/2026', end: '07/12/2026' });
    expect(defaultRange(new Date(2026, 11, 20))).toEqual({ start: '19/01/2027', end: '26/01/2027' });
  });
  it('lê o valor digitado em reais e limita o teto', () => {
    expect(parseMoneyInput('R$ 3.500')).toBe(3500);
    expect(parseMoneyInput('R$ 3.500,00')).toBe(3500);
    expect(parseMoneyInput('')).toBeNull();
    expect(parseMoneyInput('99999999')).toBe(1_000_000);
  });
  it('valor exato vira o teto da faixa; sem valor não há faixa', () => {
    expect(findBudget('custom', 3500)).toMatchObject({ id: 'custom', min: 0, max: 3500 });
    expect(findBudget('custom', null)).toBeUndefined();
    expect(findBudget('10k-15k')).toMatchObject({ min: 10000, max: 15000 });
  });
  it('etapa de orçamento só completa com faixa válida', () => {
    const a = { ...emptyAnswers(), budget: 'custom' as const };
    expect(isStepComplete('orcamento', a, TODAY)).toBe(false);
    expect(isStepComplete('orcamento', { ...a, customBudget: 4000 }, TODAY)).toBe(true);
  });
});

import { daysFromDates, finalizeAnswers, visibleSteps } from '../src/domain/discover/quiz';

describe('etapa de dias só quando as datas não definem a duração', () => {
  const base = emptyAnswers();
  it('com ida e volta válidas, pula a etapa de dias e usa as noites', () => {
    const a = { ...base, period: { mode: 'definidas' as const, startDate: '12/12/2026', endDate: '17/12/2026' } };
    expect(daysFromDates(a)).toBe(5);
    expect(visibleSteps(a).map((s) => s.id)).not.toContain('dias');
    expect(visibleSteps(a)).toHaveLength(7);
    expect(finalizeAnswers({ ...a, days: 9 }).days).toBe(5);
  });
  it('limita a duração ao máximo permitido', () => {
    const a = { ...base, period: { mode: 'definidas' as const, startDate: '01/12/2026', endDate: '15/03/2027' } };
    expect(daysFromDates(a)).toBe(30);
  });
  it('sem volta, "Ainda não sei" ou sem período, a etapa de dias continua', () => {
    expect(visibleSteps({ ...base, period: { mode: 'indefinido' } })).toHaveLength(8);
    expect(visibleSteps({ ...base, period: { mode: 'definidas', startDate: '12/12/2026', endDate: '' } })).toHaveLength(8);
    expect(visibleSteps(base)).toHaveLength(8);
    expect(finalizeAnswers({ ...base, days: 9 }).days).toBe(9);
  });
});
