export const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
] as const;

export interface ParsedDate {
  day: number;
  month: number; // 1-12
  year: number;
}

/** Aplica a máscara DD/MM/AAAA enquanto a pessoa digita (aceita só dígitos, máx. 8). */
export function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Valida DD/MM/AAAA como data real do calendário e não anterior a `today`. `today` é injetado (testável). */
export function parseBrDate(value: string, today: Date): ParsedDate | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (d < startOfToday) return null;
  return { day, month, year };
}
