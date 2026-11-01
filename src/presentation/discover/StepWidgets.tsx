import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { findBudget, formatBRL, parseMoneyInput } from '../../domain/discover/budget';
import { MONTH_NAMES, defaultRange, monthGrid, nightsBetween, parseBrParts, pickRangeDate, shortLabel, toBr } from '../../domain/discover/dates';
import { clampDays } from '../../domain/discover/quiz';
import type { Answers, BudgetId } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { dc } from './ui';

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

  // Datas padrão marcadas desde o início (editáveis): ida em 30 dias, volta 7 noites depois.
  const seed = useMemo(() => defaultRange(today), [today]);
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || a.period.mode !== null) return;
    seeded.current = true;
    const n = nightsBetween(seed.start, seed.end);
    const p = parseBrParts(seed.start);
    if (p) setView({ year: p.year, month: p.month });
    onChange({ period: { mode: 'definidas', startDate: seed.start, endDate: seed.end }, ...(n ? { days: clampDays(n) } : {}) });
  }, [a.period.mode, onChange, seed]);

  const pick = (m: (typeof OPTIONS)[number]['mode']) => {
    if (m === 'definidas') {
      const s0 = start || seed.start;
      const e0 = start ? end : seed.end;
      const p = parseBrParts(s0);
      if (p) setView({ year: p.year, month: p.month });
      onChange({ period: { mode: 'definidas', startDate: s0, endDate: e0 } });
    }
    else onChange({ period: { mode: 'indefinido' } });
  };
  const shiftMonth = (delta: number) => setView((v) => {
    const d = new Date(v.year, v.month - 1 + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const shiftYear = (delta: number) => setView((v) => {
    const y = Math.max(today.getFullYear(), v.year + delta);
    const month = y === today.getFullYear() && v.month < today.getMonth() + 1 ? today.getMonth() + 1 : v.month;
    return { year: y, month };
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
            <View style={s.titleRow}>
              <Text style={s.monthTitle} accessibilityLiveRegion="polite">{(MONTH_NAMES[view.month - 1] ?? '').replace(/^./, (c) => c.toUpperCase())}</Text>
              <View style={s.yearBox}>
                <Pressable accessibilityRole="button" accessibilityLabel="Ano anterior" disabled={view.year <= today.getFullYear()} onPress={() => shiftYear(-1)} hitSlop={8} style={[s.navBtn, { width: 24 }, view.year <= today.getFullYear() && { opacity: 0.3 }]}>
                  <DIcon name="chevronLeft" size={16} color={dc.dark} />
                </Pressable>
                <Text style={s.yearText} accessibilityLabel={`Ano ${view.year}`}>{view.year}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Próximo ano" onPress={() => shiftYear(1)} hitSlop={8} style={[s.navBtn, { width: 24 }]}>
                  <DIcon name="chevronRight" size={16} color={dc.dark} />
                </Pressable>
              </View>
            </View>
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

const TIERS: { id: BudgetId; kicker: string; value: string }[] = [
  { id: 'ate-2k', kicker: 'ATÉ', value: 'R$ 2 mil' },
  { id: '2k-5k', kicker: 'R$ 2 MIL A', value: 'R$ 5 mil' },
  { id: '5k-10k', kicker: 'R$ 5 MIL A', value: 'R$ 10 mil' },
  { id: '10k-15k', kicker: 'R$ 10 MIL A', value: 'R$ 15 mil' },
];

/** 4 faixas em 2x2, valor exato opcional e "Ainda não defini". Sem rolagem: as faixas ocupam o espaço restante. */
export function BudgetStep({ answers: a, onChange }: { answers: Answers; onChange: Patch }) {
  const { height } = useWindowDimensions();
  const compact = height < 800;
  const custom = a.budget === 'custom';
  const flex = a.budget === 'flexivel';
  const tier = (t: (typeof TIERS)[number]) => {
    const on = a.budget === t.id;
    return (
      <Pressable key={t.id} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${findBudget(t.id)?.label} por pessoa`} onPress={() => onChange({ budget: t.id })} style={({ pressed }) => [s.tier, on && s.tierOn, pressed && { opacity: 0.9 }]}>
        <View style={[s.radio, s.tierRadio, on && s.radioOn]}>{on ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
        <Text style={s.tierKicker}>{t.kicker}</Text>
        <Text style={[s.tierValue, compact && { fontSize: 22 }]}>{t.value}</Text>
        <Text style={s.tierHint}>por pessoa</Text>
      </Pressable>
    );
  };
  return (
    <View style={s.fill}>
      <View style={s.tierRow}>{TIERS.slice(0, 2).map(tier)}</View>
      <View style={s.tierRow}>{TIERS.slice(2).map(tier)}</View>

      <Pressable accessibilityRole="radio" accessibilityState={{ checked: custom }} accessibilityLabel="Definir outro valor" onPress={() => onChange({ budget: 'custom' })} style={[s.opt, s.customCard, compact && { minHeight: 48 }, custom && s.optOn]}>
        <View style={s.customHead}>
          <DIcon name="edit" size={22} color={dc.dark} />
          <View style={{ flex: 1 }}>
            <Text style={s.optTitle}>Definir outro valor</Text>
            {custom ? <Text style={s.optHint}>Seu limite por pessoa</Text> : null}
          </View>
          <View style={[s.radio, custom && s.radioOn]}>{custom ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
        </View>
        {custom ? (
          <TextInput
            accessibilityLabel="Valor máximo por pessoa em reais"
            keyboardType="number-pad"
            placeholder="R$ 3.500"
            placeholderTextColor="#B8BDBB"
            maxLength={14}
            value={a.customBudget ? formatBRL(a.customBudget) : ''}
            onChangeText={(txt) => onChange({ budget: 'custom', customBudget: parseMoneyInput(txt) })}
            style={s.moneyInput}
          />
        ) : null}
      </Pressable>

      <Pressable accessibilityRole="radio" accessibilityState={{ checked: flex }} accessibilityLabel="Ainda não defini" onPress={() => onChange({ budget: 'flexivel' })} style={[s.opt, compact && { minHeight: 48 }, flex && s.optOn]}>
        <DIcon name="infinity" size={26} color={dc.dark} />
        <View style={{ flex: 1 }}>
          <Text style={s.optTitle}>Ainda não defini</Text>
          {compact ? null : <Text style={s.optHint}>Quero explorar sem limitar o valor</Text>}
        </View>
        <View style={[s.radio, flex && s.radioOn]}>{flex ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, gap: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 60, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF' },
  optOn: { borderColor: dc.dark, backgroundColor: '#EEF3EF' },
  optTitle: { fontFamily: fonts.semibold, fontSize: 17, color: dc.dark },
  optHint: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#C9CDCB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  radioOn: { backgroundColor: dc.dark, borderColor: dc.dark },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yearBox: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 14, backgroundColor: '#F1F3F0', paddingHorizontal: 4 },
  yearText: { fontFamily: fonts.semibold, fontSize: 15, color: dc.dark, minWidth: 40, textAlign: 'center' },
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

  tierRow: { flex: 1, flexDirection: 'row', gap: 10, maxHeight: 150 },
  tier: { flex: 1, justifyContent: 'center', gap: 2, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF' },
  tierOn: { borderColor: dc.dark, borderWidth: 1.5, backgroundColor: '#EEF3EF' },
  tierRadio: { position: 'absolute', top: 10, right: 10 },
  tierKicker: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 1.4, color: dc.muted },
  tierValue: { fontFamily: fonts.bold, fontSize: 25, letterSpacing: -0.4, color: dc.dark },
  tierHint: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  customCard: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  customHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  moneyInput: { fontFamily: fonts.semibold, fontSize: 20, color: dc.dark, borderRadius: 12, borderWidth: 1, borderColor: '#D9DDDA', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, outlineStyle: 'none' } as never,
});
