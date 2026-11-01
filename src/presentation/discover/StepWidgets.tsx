import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { BUDGETS, findBudget } from '../../domain/discover/budget';
import { MONTH_NAMES, monthGrid, nightsBetween, parseBrParts, pickRangeDate, shortLabel, toBr } from '../../domain/discover/dates';
import { clampDays } from '../../domain/discover/quiz';
import type { Answers, BudgetId } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { cardShadow, dc } from './ui';

type Patch = (patch: Partial<Answers>) => void;

/* ───────────────────────── Período ───────────────────────── */

const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] as const;

const OPTIONS = [
  { mode: 'definidas', label: 'Datas exatas', hint: 'Já tenho os dias definidos', icon: 'calendar' },
  { mode: 'indefinido', label: 'Ainda não sei', hint: 'Quero explorar as possibilidades', icon: 'help' },
] as const;

/** Duas opções + calendário de ida e volta dentro do painel (só quando "Datas exatas"). Sem rolagem: a grade ocupa o espaço restante. */
export function PeriodStep({ answers: a, onChange, today }: { answers: Answers; onChange: Patch; today: Date }) {
  const { height } = useWindowDimensions();
  const compact = height < 800;
  const mode = a.period.mode;
  const start = a.period.mode === 'definidas' ? a.period.startDate : '';
  const end = a.period.mode === 'definidas' ? a.period.endDate ?? '' : '';
  const startParts = parseBrParts(start);
  const [view, setView] = useState({ year: (startParts ?? { year: today.getFullYear() }).year, month: (startParts ?? { month: today.getMonth() + 1 }).month });
  const grid = useMemo(() => monthGrid(view.year, view.month), [view]);
  const nights = nightsBetween(start, end);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const atMinMonth = view.year === today.getFullYear() && view.month === today.getMonth() + 1;

  const pick = (m: (typeof OPTIONS)[number]['mode']) => {
    if (m === 'definidas') onChange({ period: { mode: 'definidas', startDate: start, endDate: end } });
    else onChange({ period: { mode: 'indefinido' } });
  };
  const shiftMonth = (delta: number) => setView((v) => {
    const d = new Date(v.year, v.month - 1 + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const tapDay = (day: number) => {
    const next = pickRangeDate(start, end, toBr(view.year, view.month, day));
    const n = nightsBetween(next.start, next.end);
    onChange({ period: { mode: 'definidas', startDate: next.start, endDate: next.end }, ...(n ? { days: clampDays(n) } : {}) });
  };

  return (
    <View style={s.fill} accessibilityRole="radiogroup">
      {OPTIONS.map((o) => {
        const on = mode === o.mode;
        return (
          <Pressable key={o.mode} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${o.label}. ${o.hint}`} onPress={() => pick(o.mode)} style={({ pressed }) => [s.opt, compact && { minHeight: 48 }, on && s.optOn, pressed && { opacity: 0.9 }]}>
            <DIcon name={o.icon} size={26} color={dc.dark} />
            <View style={{ flex: 1 }}>
              <Text style={s.optTitle}>{o.label}</Text>
              {compact ? null : <Text style={s.optHint}>{o.hint}</Text>}
            </View>
            <View style={[s.radio, on && s.radioOn]}>{on ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
          </Pressable>
        );
      })}

      {mode === 'definidas' ? (
        <View style={[s.cal, compact && { padding: 8, gap: 4 }]}>
          <View style={s.fieldsRow}>
            <View style={[s.dateField, compact && s.dateFieldRow, !end && !!start && s.dateFieldActive]}>
              <Text style={s.fieldKicker}>IDA</Text>
              <Text style={s.fieldValue}>{shortLabel(start) || 'Escolha'}</Text>
            </View>
            <View style={[s.dateField, compact && s.dateFieldRow, !!start && !end && s.dateFieldActive]}>
              <Text style={s.fieldKicker}>VOLTA</Text>
              <Text style={s.fieldValue}>{shortLabel(end) || 'Escolha'}</Text>
            </View>
          </View>

          <View style={s.monthHead}>
            <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" disabled={atMinMonth} onPress={() => shiftMonth(-1)} hitSlop={10} style={[s.navBtn, atMinMonth && { opacity: 0.3 }]}>
              <DIcon name="chevronLeft" size={20} color={dc.dark} />
            </Pressable>
            <Text style={s.monthTitle} accessibilityLiveRegion="polite">{(MONTH_NAMES[view.month - 1] ?? '').replace(/^./, (c) => c.toUpperCase())} {view.year}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => shiftMonth(1)} hitSlop={10} style={s.navBtn}>
              <DIcon name="chevronRight" size={20} color={dc.dark} />
            </Pressable>
          </View>

          <View style={s.weekRow}>{WEEKDAYS.map((w, i) => <Text key={i} style={s.weekday}>{w}</Text>)}</View>
          <View style={s.grid}>
            {[0, 1, 2, 3, 4, 5].map((r) => (
              <View key={r} style={s.weekLine}>
                {[0, 1, 2, 3, 4, 5, 6].map((c) => {
                  const day = grid[r * 7 + c] ?? null;
                  if (day === null) return <View key={c} style={s.cell} />;
                  const label = toBr(view.year, view.month, day);
                  const time = new Date(view.year, view.month - 1, day).getTime();
                  const past = time < startOfToday;
                  const isStart = label === start;
                  const isEnd = label === end;
                  const sMs = startParts ? new Date(startParts.year, startParts.month - 1, startParts.day).getTime() : null;
                  const eP = parseBrParts(end);
                  const eMs = eP ? new Date(eP.year, eP.month - 1, eP.day).getTime() : null;
                  const inRange = sMs !== null && eMs !== null && time > sMs && time < eMs;
                  return (
                    <Pressable key={c} disabled={past} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: isStart || isEnd, disabled: past }} onPress={() => tapDay(day)} style={[s.cell, inRange && s.cellRange, isStart && eMs !== null && s.cellRangeStart, isEnd && s.cellRangeEnd]}>
                      <View style={[s.dayDot, compact && { width: 24, height: 24, borderRadius: 12 }, (isStart || isEnd) && s.dayDotOn]}>
                        <Text style={[s.dayText, past && { color: '#C4C9C6' }, (isStart || isEnd) && s.dayTextOn]}>{day}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
          <Text style={[s.calNote, compact && { fontSize: 11 }]} accessibilityLiveRegion="polite">
            {nights ? `${nights} ${nights === 1 ? 'noite' : 'noites'} para aproveitar no seu ritmo.` : start ? 'Agora toque na data de volta.' : 'Toque na data de ida.'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/* ───────────────────────── Orçamento ───────────────────────── */


const STAIRS: { id: BudgetId; short: string; n: number }[] = [
  { id: 'ate-2k', short: 'Até 2 mil', n: 1 },
  { id: '2k-5k', short: '2 a 5 mil', n: 2 },
  { id: '5k-10k', short: '5 a 10 mil', n: 3 },
  { id: '10k-mais', short: '10 mil+', n: 4 },
];

/** Degraus crescentes: quanto maior o degrau, maior o orçamento. Resumo da faixa escolhida no topo. */
export function BudgetStep({ answers: a, onChange }: { answers: Answers; onChange: Patch }) {
  const chosen = findBudget(a.budget);
  const flex = a.budget === 'flexivel';
  return (
    <View style={s.fill}>
      <View style={s.hero}>
        <View style={s.heroRule} />
        <Text style={s.heroKicker}>ORÇAMENTO POR PESSOA</Text>
        <Text style={s.heroValue} numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion="polite">{chosen ? chosen.label : 'Escolha um degrau'}</Text>
        <Text style={s.heroNote}>Inclui passagem (ida e volta) e hospedagem.</Text>
      </View>

      <View style={s.stairs} accessibilityRole="radiogroup">
        {STAIRS.map((st) => {
          const on = a.budget === st.id;
          return (
            <Pressable key={st.id} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={findBudget(st.id)?.label} onPress={() => onChange({ budget: st.id })} style={({ pressed }) => [s.stairCol, pressed && { opacity: 0.85 }]}>
              <View style={{ flexGrow: 5 - st.n, flexBasis: 0 }} />
              <View style={[s.step, !on && s.stepOff, { flexGrow: st.n }, on && s.stepOn]}>
                <Text style={[s.stepGlyph, on && { color: dc.lime }]}>{'$'.repeat(st.n)}</Text>
                {on ? <View style={s.stepCheck}><DIcon name="check" size={14} color={dc.dark} /></View> : null}
              </View>
              <Text style={[s.stepLabel, on && { fontFamily: fonts.bold }]} numberOfLines={1}>{st.short}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="radio" accessibilityState={{ checked: flex }} accessibilityLabel={BUDGETS[4]?.label} onPress={() => onChange({ budget: 'flexivel' })} style={({ pressed }) => [s.flex, cardShadow, flex && s.flexOn, pressed && { opacity: 0.85 }]}>
        <View style={s.seal}><DIcon name="infinity" size={22} color={dc.dark} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.flexTitle}>Ainda não defini</Text>
          <Text style={s.flexHint}>Não limitamos por valor</Text>
        </View>
        <View style={[s.radio, flex && s.radioOn]}>{flex ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, gap: 12 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF' },
  optOn: { borderColor: dc.dark, backgroundColor: '#EEF3EF' },
  optTitle: { fontFamily: fonts.semibold, fontSize: 17, color: dc.dark },
  optHint: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  cal: { flex: 1, borderRadius: 20, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', padding: 12, gap: 6 },
  fieldsRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#D9DDDA', paddingHorizontal: 12, paddingVertical: 6 },
  dateFieldActive: { borderColor: dc.dark, borderWidth: 1.5 },
  dateFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  fieldKicker: { fontFamily: fonts.medium, fontSize: 10, letterSpacing: 1.2, color: dc.muted },
  fieldValue: { fontFamily: fonts.semibold, fontSize: 17, color: dc.dark },
  monthHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { fontFamily: fonts.semibold, fontSize: 16, color: dc.dark },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, color: dc.muted },
  grid: { flex: 1, gap: 2 },
  weekLine: { flex: 1, flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cellRange: { backgroundColor: '#E4EDE6' },
  cellRangeStart: { backgroundColor: '#E4EDE6', borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  cellRangeEnd: { backgroundColor: '#E4EDE6', borderTopRightRadius: 16, borderBottomRightRadius: 16 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayDotOn: { backgroundColor: dc.dark },
  dayText: { fontFamily: fonts.regular, fontSize: 14, color: dc.dark },
  dayTextOn: { fontFamily: fonts.semibold, color: '#FFFFFF' },
  calNote: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted },

  hero: { paddingVertical: 4, gap: 4 },
  heroRule: { width: 28, height: 2, borderRadius: 1, backgroundColor: dc.lime, marginBottom: 6 },
  heroKicker: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.8, color: dc.muted },
  heroValue: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 36, letterSpacing: -0.5, color: dc.dark },
  heroNote: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  stairs: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  stairCol: { flex: 1, justifyContent: 'flex-end', gap: 6 },
  step: { flexBasis: 0, minHeight: 44, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: '#F1F3F0', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 },
  stepOff: { borderWidth: 1, borderColor: '#D9DDDA' },
  stepOn: { backgroundColor: dc.dark, borderTopWidth: 3, borderTopColor: dc.lime },
  seal: { width: 40, height: 40, borderRadius: 20, backgroundColor: dc.mint, borderWidth: 1, borderColor: 'rgba(31,61,54,0.18)', alignItems: 'center', justifyContent: 'center' },
  stepGlyph: { fontFamily: fonts.bold, fontSize: 18, color: dc.teal },
  stepCheck: { marginTop: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: dc.lime, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontFamily: fonts.medium, fontSize: 12, letterSpacing: 0.2, color: dc.dark, textAlign: 'center' },
  flex: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: dc.border },
  flexOn: { borderWidth: 1.5, borderColor: dc.dark, backgroundColor: '#FAFBE3' },
  flexTitle: { fontFamily: fonts.bold, fontSize: 17, color: dc.dark },
  flexHint: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#C9CDCB', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: dc.dark, borderColor: dc.dark },
});
