import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BUDGETS, findBudget } from '../../domain/discover/budget';
import { MONTH_NAMES, maskDate, parseBrDate } from '../../domain/discover/dates';
import type { Answers, BudgetId } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { cardShadow, dc } from './ui';

type Patch = (patch: Partial<Answers>) => void;

/* ───────────────────────── Período ───────────────────────── */

const OPTIONS = [
  { mode: 'definidas', label: 'Datas exatas', hint: 'Já sei o dia da ida', icon: 'calendar' },
  { mode: 'mes', label: 'Só o mês', hint: 'Tenho um mês aproximado', icon: 'calendarMonth' },
  { mode: 'indefinido', label: 'Ainda não sei', hint: 'Sem data, tudo bem', icon: 'help' },
] as const;

/** Três opções sempre visíveis. A escolhida se expande e mostra o campo/grade dentro do próprio cartão. Sem abas nem painel vazio. */
export function PeriodStep({ answers: a, onChange, today }: { answers: Answers; onChange: Patch; today: Date }) {
  const mode = a.period.mode;
  const startDate = a.period.mode === 'definidas' ? a.period.startDate : '';
  const month = a.period.mode === 'mes' ? a.period.month : null;
  const dateError = startDate.length === 10 && !parseBrDate(startDate, today) ? 'Informe uma data válida a partir de hoje.' : undefined;

  const pick = (m: (typeof OPTIONS)[number]['mode']) => {
    if (m === 'definidas') onChange({ period: { mode: 'definidas', startDate } });
    else if (m === 'mes') onChange({ period: { mode: 'mes', month } });
    else onChange({ period: { mode: 'indefinido' } });
  };

  return (
    <View style={s.fill} accessibilityRole="radiogroup">
      {OPTIONS.map((o) => {
        const on = mode === o.mode;
        const grows = on && o.mode !== 'indefinido';
        return (
          <View key={o.mode} style={[s.opt, cardShadow, on && s.optOn, grows ? { flex: 1, minHeight: 150 } : { flexGrow: 1, flexBasis: 0, maxHeight: 96, minHeight: 72 }]}>
            <Pressable accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${o.label}. ${o.hint}`} onPress={() => pick(o.mode)} style={({ pressed }) => [s.optHead, !grows && { flex: 1 }, pressed && { opacity: 0.85 }]}>
              <View style={s.optIcon}><DIcon name={o.icon} size={26} color={dc.dark} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.optTitle}>{o.label}</Text>
                <Text style={s.optHint}>{o.hint}</Text>
              </View>
              <View style={[s.radio, on && s.radioOn]}>{on ? <DIcon name="check" size={14} color="#FFFFFF" /> : null}</View>
            </Pressable>

            {on && o.mode === 'definidas' ? (
              <View style={s.optBody}>
                <TextInput
                  accessibilityLabel="Data de ida (DD/MM/AAAA)"
                  keyboardType="number-pad"
                  maxLength={10}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#B8BDBB"
                  value={startDate}
                  onChangeText={(t) => onChange({ period: { mode: 'definidas', startDate: maskDate(t) } })}
                  style={[s.dateInput, !!dateError && { color: '#B3261E' }]}
                />
                <Text style={[s.optHint, !!dateError && { color: '#B3261E' }]} accessibilityLiveRegion="polite">{dateError ?? 'Data de ida, ex.: 15/01/2027'}</Text>
              </View>
            ) : null}

            {on && o.mode === 'mes' ? (
              <View style={s.months}>
                {[0, 1].map((r) => (
                  <View key={r} style={s.monthRow}>
                    {[0, 1, 2, 3, 4, 5].map((c) => {
                      const i = r * 6 + c;
                      const sel = month === i + 1;
                      return (
                        <Pressable key={i} accessibilityRole="radio" accessibilityState={{ checked: sel }} accessibilityLabel={MONTH_NAMES[i]} onPress={() => onChange({ period: { mode: 'mes', month: i + 1 } })} style={({ pressed }) => [s.month, sel && s.monthOn, pressed && { opacity: 0.85 }]}>
                          <Text style={[s.monthText, sel && s.monthTextOn]} numberOfLines={1}>{(MONTH_NAMES[i] ?? '').slice(0, 3).replace(/^./, (x) => x.toUpperCase())}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
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
  opt: { borderRadius: 24, borderWidth: 1, borderColor: dc.border, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  optOn: { borderWidth: 2, borderColor: dc.dark },
  optHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 70, flexGrow: 0 },
  optIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: dc.mint, alignItems: 'center', justifyContent: 'center' },
  optTitle: { fontFamily: fonts.bold, fontSize: 19, color: dc.dark },
  optHint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: dc.muted },
  optBody: { flex: 1, justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  dateInput: { fontFamily: fonts.bold, fontSize: 32, color: dc.dark, width: '100%', paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: dc.lime, outlineStyle: 'none' } as never,
  months: { flex: 1, paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  monthRow: { flex: 1, flexDirection: 'row', gap: 6 },
  month: { flex: 1, minHeight: 40, borderRadius: 14, backgroundColor: '#F1F3F0', alignItems: 'center', justifyContent: 'center' },
  monthOn: { backgroundColor: dc.lime, borderWidth: 2, borderColor: dc.dark },
  monthText: { fontFamily: fonts.semibold, fontSize: 14, color: dc.dark },
  monthTextOn: { fontFamily: fonts.bold },

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
