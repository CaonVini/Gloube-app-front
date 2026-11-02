import type { ImageSourcePropType } from 'react-native';

/** Item da barra inferior. */
export interface NavItem {
  key: string;
  label: string;
  icon: ImageSourcePropType;
  /** Ícone alternativo quando o item está ativo (opcional). */
  activeIcon?: ImageSourcePropType;
}

/* eslint-disable @typescript-eslint/no-require-imports */
const icons = {
  discover: require('../../../assets/images/icons/nav-discover.png'),
  discoverActive: require('../../../assets/images/icons/nav-discover-active.png'),
  plan: require('../../../assets/images/icons/nav-plan.png'),
  aurora: require('../../../assets/images/icons/nav-aurora.png'),
  trip: require('../../../assets/images/icons/nav-trip.png'),
  wallet: require('../../../assets/images/icons/nav-wallet.png'),
} satisfies Record<string, ImageSourcePropType>;
/* eslint-enable @typescript-eslint/no-require-imports */

/** Itens padrão do app, na ordem do mockup (o botão central em destaque é Viagem). */
export const DEFAULT_NAV_ITEMS: readonly NavItem[] = [
  { key: 'discover', label: 'Descubra', icon: icons.discover, activeIcon: icons.discoverActive },
  { key: 'plan', label: 'Planeje', icon: icons.plan },
  { key: 'trip', label: 'Viagem', icon: icons.trip },
  { key: 'wallet', label: 'Carteira', icon: icons.wallet },
  { key: 'aurora', label: 'Aurora', icon: icons.aurora },
];

/** Regras puras (testáveis sem renderizar). */
export function isActive(item: NavItem, activeKey: string): boolean {
  return item.key === activeKey;
}

/** Inset inferior mínimo evita barra colada à borda em aparelhos sem safe area (inset 0). */
export const MIN_BOTTOM_PADDING = 8;
export function bottomPadding(inset: number): number {
  return Math.max(Number.isFinite(inset) ? inset : 0, MIN_BOTTOM_PADDING);
}

export function tabAccessibility(item: NavItem, active: boolean) {
  return {
    accessibilityRole: 'tab' as const,
    accessibilityLabel: item.label,
    accessibilityState: { selected: active },
  };
}
