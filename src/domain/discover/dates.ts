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

/** Mês/ano válidos e não anteriores ao mês atual. */
export function isMonthYearValid(month: number | null, year: number | null, today: Date): boolean {
  if (month === null || year === null || !Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) return false;
  return year * 12 + month >= today.getFullYear() * 12 + today.getMonth() + 1;
}

const SHORT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'] as const;

/** Formata DD/MM/AAAA. */
export function toBr(year: number, month: number, day: number): string {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

/** Lê DD/MM/AAAA como data real do calendário (sem checar se é passada). */
export function parseBrParts(value: string | undefined): ParsedDate | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value ?? '');
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return { day, month, year };
}

/** "12/12/2026" -> "12 dez". Vazio se inválida. */
export function shortLabel(value: string | undefined): string {
  const p = parseBrParts(value);
  return p ? `${p.day} ${SHORT_MONTHS[p.month - 1]}` : '';
}

/** Noites entre ida e volta (volta depois da ida). null se alguma data for inválida ou a volta não for posterior. */
export function nightsBetween(start: string | undefined, end: string | undefined): number | null {
  const a = parseBrParts(start);
  const b = parseBrParts(end);
  if (!a || !b) return null;
  const ms = Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day);
  const n = Math.round(ms / 86_400_000);
  return n > 0 ? n : null;
}

/** 42 células (6 semanas, semana começando na segunda): dia do mês ou null. */
export function monthGrid(year: number, month: number): (number | null)[] {
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const total = new Date(year, month, 0).getDate();
  return Array.from({ length: 42 }, (_, i) => {
    const day = i - offset + 1;
    return day >= 1 && day <= total ? day : null;
  });
}

/** Regra de seleção de intervalo: 1º toque define a ida; 2º, posterior, define a volta; outro toque recomeça. */
export function pickRangeDate(start: string, end: string | undefined, tapped: string): { start: string; end: string } {
  const s = parseBrParts(start);
  const t = parseBrParts(tapped);
  if (!t) return { start, end: end ?? '' };
  if (!s || end) return { start: tapped, end: '' };
  const diff = Date.UTC(t.year, t.month - 1, t.day) - Date.UTC(s.year, s.month - 1, s.day);
  if (diff > 0) return { start, end: tapped };
  return { start: tapped, end: '' };
}

/** Datas sugeridas por padrão: ida daqui a 30 dias, volta 7 noites depois. */
export function defaultRange(today: Date): { start: string; end: string } {
  const s = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 7);
  return { start: toBr(s.getFullYear(), s.getMonth() + 1, s.getDate()), end: toBr(e.getFullYear(), e.getMonth() + 1, e.getDate()) };
}
