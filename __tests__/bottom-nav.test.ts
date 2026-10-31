import { DEFAULT_NAV_ITEMS, MIN_BOTTOM_PADDING, bottomPadding, isActive, tabAccessibility } from '../src/presentation/navigation/nav-items';

describe('DEFAULT_NAV_ITEMS', () => {
  it('segue a ordem do mockup', () => {
    expect(DEFAULT_NAV_ITEMS.map((i) => i.label)).toEqual(['Descubra', 'Planeje', 'Aurora', 'Viagem', 'Carteira']);
  });
  it('tem chaves únicas e exatamente um botão central em destaque, no meio', () => {
    expect(new Set(DEFAULT_NAV_ITEMS.map((i) => i.key)).size).toBe(DEFAULT_NAV_ITEMS.length);
    const highlighted = DEFAULT_NAV_ITEMS.filter((i) => i.highlight);
    expect(highlighted).toHaveLength(1);
    expect(DEFAULT_NAV_ITEMS[2]).toBe(highlighted[0]);
  });
});

describe('isActive', () => {
  it('só o item com a chave ativa é ativo', () => {
    expect(DEFAULT_NAV_ITEMS.filter((i) => isActive(i, 'plan')).map((i) => i.key)).toEqual(['plan']);
    expect(DEFAULT_NAV_ITEMS.some((i) => isActive(i, 'inexistente'))).toBe(false);
  });
});

describe('bottomPadding', () => {
  it('respeita o inset quando maior que o mínimo', () => expect(bottomPadding(34)).toBe(34));
  it('aplica mínimo quando inset é 0, negativo ou inválido', () => {
    expect(bottomPadding(0)).toBe(MIN_BOTTOM_PADDING);
    expect(bottomPadding(-5)).toBe(MIN_BOTTOM_PADDING);
    expect(bottomPadding(NaN)).toBe(MIN_BOTTOM_PADDING);
  });
});

describe('tabAccessibility', () => {
  it('expõe role tab, rótulo e estado selecionado', () => {
    expect(tabAccessibility(DEFAULT_NAV_ITEMS[0]!, true)).toEqual({
      accessibilityRole: 'tab',
      accessibilityLabel: 'Descubra',
      accessibilityState: { selected: true },
    });
    expect(tabAccessibility(DEFAULT_NAV_ITEMS[1]!, false).accessibilityState.selected).toBe(false);
  });
});
