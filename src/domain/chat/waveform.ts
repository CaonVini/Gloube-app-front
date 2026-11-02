/** Onda da gravação: converte o nível do microfone (dBFS) em altura 0..1 e mantém um histórico curto. */
export const WAVE_BARS = 28;
const FLOOR_DB = -50;

/** -50 dB (ou menos) = 0; 0 dB = 1. Valor ausente/ inválido = 0. */
export function meterToLevel(db: number | null | undefined): number {
  if (typeof db !== 'number' || !Number.isFinite(db)) return 0;
  return Math.min(1, Math.max(0, (db - FLOOR_DB) / -FLOOR_DB));
}

/** Acrescenta um nível e mantém só os últimos `max`. */
export function pushLevel(history: readonly number[], level: number, max = WAVE_BARS): number[] {
  const next = [...history, Math.min(1, Math.max(0, level))];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** Altura (px) de uma barra: mínimo visível + proporção do nível. */
export function barHeight(level: number, min = 4, max = 26): number {
  return Math.round(min + Math.min(1, Math.max(0, level)) * (max - min));
}
