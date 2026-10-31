import type { DestinationZone, MacroRegion, Origin } from './types';

/** Cidades de saída (aproximação: o que importa para o cálculo é a macrorregião). */
export const ORIGINS: readonly Origin[] = [
  { id: 'sao-paulo', label: 'São Paulo', region: 'sudeste' },
  { id: 'rio', label: 'Rio de Janeiro', region: 'sudeste' },
  { id: 'belo-horizonte', label: 'Belo Horizonte', region: 'sudeste' },
  { id: 'curitiba', label: 'Curitiba', region: 'sul' },
  { id: 'porto-alegre', label: 'Porto Alegre', region: 'sul' },
  { id: 'brasilia', label: 'Brasília', region: 'centro-oeste' },
  { id: 'goiania', label: 'Goiânia', region: 'centro-oeste' },
  { id: 'salvador', label: 'Salvador', region: 'nordeste' },
  { id: 'recife', label: 'Recife', region: 'nordeste' },
  { id: 'fortaleza', label: 'Fortaleza', region: 'nordeste' },
  { id: 'manaus', label: 'Manaus', region: 'norte' },
  { id: 'belem', label: 'Belém', region: 'norte' },
];

export function findOrigin(id: string | null): Origin | undefined {
  return ORIGINS.find((o) => o.id === id);
}

/** Distância aproximada (km) entre macrorregiões, usada só para estimar passagem e "perto de casa". */
const DOMESTIC: Record<MacroRegion, Record<MacroRegion, number>> = {
  sudeste: { sudeste: 400, sul: 900, nordeste: 1800, 'centro-oeste': 1000, norte: 2800 },
  sul: { sudeste: 900, sul: 400, nordeste: 2800, 'centro-oeste': 1500, norte: 3200 },
  nordeste: { sudeste: 1800, sul: 2800, nordeste: 700, 'centro-oeste': 1700, norte: 2000 },
  'centro-oeste': { sudeste: 1000, sul: 1500, nordeste: 1700, 'centro-oeste': 500, norte: 2000 },
  norte: { sudeste: 2800, sul: 3200, nordeste: 2000, 'centro-oeste': 2000, norte: 800 },
};

const INTERNATIONAL: Record<'america-sul' | 'america-central' | 'europa' | 'asia', Record<MacroRegion, number>> = {
  'america-sul': { sudeste: 2800, sul: 2000, nordeste: 4500, 'centro-oeste': 3200, norte: 4500 },
  'america-central': { sudeste: 6500, sul: 7000, nordeste: 5800, 'centro-oeste': 6500, norte: 5500 },
  europa: { sudeste: 8500, sul: 9000, nordeste: 7000, 'centro-oeste': 8500, norte: 7500 },
  asia: { sudeste: 14000, sul: 14500, nordeste: 13000, 'centro-oeste': 14000, norte: 13500 },
};

export const NEAR_HOME_KM = 1000;

export function distanceKm(from: MacroRegion, to: DestinationZone): number {
  if (to === 'america-sul' || to === 'america-central' || to === 'europa' || to === 'asia') return INTERNATIONAL[to][from];
  return DOMESTIC[from][to];
}

/** Passagem estimada por pessoa (ida e volta), arredondada a R$ 50. Internacional é mais caro por km. */
export function transportCost(from: MacroRegion, to: DestinationZone, domestic: boolean): number {
  const km = distanceKm(from, to);
  const raw = 150 + km * (domestic ? 0.5 : 0.75);
  return Math.round(raw / 50) * 50;
}
