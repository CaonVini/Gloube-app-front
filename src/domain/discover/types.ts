/** Tipos do fluxo "Descubra um destino". Tudo local e fictício (sem API). */

export type Climate = 'frio' | 'calor' | 'tanto-faz';
export type Experience = 'praia' | 'montanha' | 'cidade' | 'natureza' | 'neve';
export type Reach = 'perto' | 'brasil' | 'internacional';
export type Companion = 'casal' | 'amigos' | 'familia' | 'solo';
export type Need = 'criancas' | 'idosos' | 'acessibilidade' | 'pets';
export type BudgetId = 'ate-2k' | '2k-5k' | '5k-10k' | '10k-mais' | 'flexivel';

export type MacroRegion = 'sudeste' | 'sul' | 'nordeste' | 'centro-oeste' | 'norte';
export type DestinationZone = MacroRegion | 'america-sul' | 'america-central' | 'europa' | 'asia';

export interface Origin {
  id: string;
  label: string;
  region: MacroRegion;
}

export type Period =
  | { mode: null }
  | { mode: 'indefinido' }
  | { mode: 'mes'; month: number | null }
  | { mode: 'definidas'; startDate: string; endDate?: string };

export interface Answers {
  climate: Climate | null;
  experiences: Experience[];
  reach: Reach | null;
  origin: string | null;
  /** true quando a origem não veio da tela Nova viagem e usamos a padrão. */
  originAssumed: boolean;
  companion: Companion | null;
  needs: Need[];
  period: Period;
  days: number;
  budget: BudgetId | null;
}

/** Informação de cuidado (pet/acessibilidade). `verified=false` => nunca prometer; mostrar "Confirme antes de reservar". */
export interface CareInfo {
  verified: boolean;
  allowed: boolean;
  note?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  domestic: boolean;
  zone: DestinationZone;
  description: string;
  climate: 'frio' | 'calor' | 'ameno';
  experiences: Experience[];
  suits: Companion[];
  kidFriendly: boolean;
  seniorFriendly: boolean;
  /** Estimativa fictícia de gasto diário por pessoa (hospedagem + alimentação + passeios), em R$. */
  dailyCost: number;
  minDays: number;
  bestMonths: number[];
  pets: CareInfo;
  accessibility: CareInfo;
}

export interface CareNote {
  need: 'pets' | 'acessibilidade';
  text: string;
  tone: 'ok' | 'warn';
}

export interface Recommendation {
  destination: Destination;
  score: number;
  /** Estimativa por pessoa (transporte + hospedagem/alimentação/passeios), em R$. */
  estimatedCost: number;
  transportCost: number;
  why: string;
  care: CareNote[];
}
