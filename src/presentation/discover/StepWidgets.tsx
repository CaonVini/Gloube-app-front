import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BUDGETS, findBudget } from '../../domain/discover/budget';
import { MONTH_NAMES, maskDate, parseBrDate } from '../../domain/discover/dates';
import type { Answers, BudgetId } from '../../domain/discover/types';
import { fonts } from '../theme/auth-theme';
import { DIcon } from './icons';
import { cardShadow, dc } from './ui';

type Patch = (patch: Partial<Answers>) => void;

/* ───────────────────────── Período ───────────────────────── */

const TABS = [
  { mode: 'definidas', label: 'Datas', icon: 'calendar' },
  { mode: 'mes', label: 'Mês', icon: 'calendarMonth' },
  { mode: 'indefinido', label: 'Ainda não sei', icon: 'help' },
] as const;

/** Seletor segmentado + painel que muda conforme a opção. Sem rolagem: o painel ocupa o espaço restante. */
export function PeriodStep({ answers: a, onChange, today }: { answers: Answers; onChange: Patch; today: Date }) {
  const mode = a.period.mode;
  const startDate = a.period.mode === 'definidas' ? a.period.startDate : '';
  const month = a.period.mode === 'mes' ? a.period.month : null;
  const dateError = startDate.length === 10 && !parseBrDate(startDate, today) ? 'Informe uma data válida a partir de hoje.' : undefined;

  const pick = (m: (typeof TABS)[number]['mode']) => {
    if (m === 'definidas') onChange({ period: { mode: 'definidas', startDate } });
    else if (m === 'mes') onChange({ period: { mode: 'mes', month } });
    else onChange({ period: { mode: 'indefinido' } });
  };

  return (
    <View style={s.fill}>
      <View style={s.tabs} accessibilityRole="radiogroup">
        {TABS.map((t) => {
          const on = mode === t.mode;
          return (
            <Pressable key={t.mode} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={t.label} onPress={() => pick(t.mode)} style={({ pressed }) => [s.tab, on && s.tabOn, pressed && { opacity: 0.85 }]}>
              <DIcon name={t.icon} size={22} color={on ? '#FFFFFF' : dc.dark} />
              <Text style={[s.tabText, on && s.tabTextOn]} numberOfLines={1}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[s.panel, cardShadow]}>
        {mode === null ? (
          <View style={s.center}>
            <View style={s.bigIcon}><DIcon name="calendar" size={40} color={dc.dark} /></View>
            <Text style={s.panelTitle}>Quando você quer ir?</Text>
            <Text style={s.panelText}>Escolha acima: uma data, um mês aproximado ou “Ainda não sei”.</Text>
          </View>
        ) : null}

        {mode === 'definidas' ? (
          <View style={s.fill}>
            <View style={s.dateBand}>
              <DIcon name="calendar" size={26} color="#FFFFFF" />
              <Text style={s.dateBandText}>Data de ida</Text>
            </View>
            <View style={s.dateBody}>
              <TextInput
                accessibilityLabel="Data de ida (DD/MM/AAAA)"
                keyboardType="number-pad"
                maxLength={10}
                placeholder="15/01/2027"
                placeholderTextColor="#B8BDBB"
                value={startDate}
                onChangeText={(t) => onChange({ period: { mode: 'definidas', startDate: maskDate(t) } })}
                style={[s.dateInput, !!dateError && { color: '#B3261E' }]}
              />
              <Text style={[s.panelText, !!dateError && { color: '#B3261E' }]} accessibilityLiveRegion="polite">
                {dateError ?? 'Digite no formato dia/mês/ano.'}
              </Text>
            </View>
          </View>
        ) : null}

        {mode === 'mes' ? (
          <View style={s.months}>
            {[0, 1, 2].map((r) => (
              <View key={r} style={s.monthRow}>
                {[0, 1, 2, 3].map((c) => {
                  const i = r * 4 + c;
                  const on = month === i + 1;
                  return (
                    <Pressable key={i} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={MONTH_NAMES[i]} onPress={() => onChange({ period: { mode: 'mes', month: i + 1 } })} style={({ pressed }) => [s.month, on && s.monthOn, pressed && { opacity: 0.85 }]}>
                      <Text style={[s.monthNum, on && { color: dc.dark }]}>{String(i + 1).padStart(2, '0')}</Text>
                      <Text style={[s.monthText, on && s.monthTextOn]} numberOfLines={1}>{(MONTH_NAMES[i] ?? '').slice(0, 3).replace(/^./, (x) => x.toUpperCase())}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        ) : null}

        {mode === 'indefinido' ? (
          <View style={s.center}>
            <View style={[s.bigIcon, { backgroundColor: dc.lime }]}><DIcon name="help" size={40} color={dc.dark} /></View>
            <Text style={s.panelTitle}>Sem pressa</Text>
            <Text style={s.panelText}>Vamos sugerir destinos sem considerar datas. Você ajusta quando decidir.</Text>
          </View>
        ) : null}
      </View>
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
      <View style={[s.hero, cardShadow]}>
        <Text style={s.heroKicker}>Orçamento por pessoa</Text>
        <Text style={s.heroValue} numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion="polite">{chosen ? chosen.label : 'Escolha um degrau'}</Text>
        <Text style={s.heroNote}>Inclui passagem (ida e volta) e hospedagem.</Text>
      </View>

      <View style={s.stairs} accessibilityRole="radiogroup">
        {STAIRS.map((st) => {
          const on = a.budget === st.id;
          return (
            <Pressable key={st.id} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={findBudget(st.id)?.label} onPress={() => onChange({ budget: st.id })} style={({ pressed }) => [s.stairCol, pressed && { opacity: 0.85 }]}>
              <View style={{ flexGrow: 5 - st.n, flexBasis: 0 }} />
              <View style={[s.step, { flexGrow: st.n }, on && s.stepOn]}>
                <Text style={[s.stepGlyph, on && { color: dc.dark }]}>{'$'.repeat(st.n)}</Text>
                {on ? <View style={s.stepCheck}><DIcon name="check" size={14} color="#FFFFFF" /></View> : null}
              </View>
              <Text style={[s.stepLabel, on && { fontFamily: fonts.bold }]} numberOfLines={1}>{st.short}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="radio" accessibilityState={{ checked: flex }} accessibilityLabel={BUDGETS[4]?.label} onPress={() => onChange({ budget: 'flexivel' })} style={({ pressed }) => [s.flex, cardShadow, flex && s.flexOn, pressed && { opacity: 0.85 }]}>
        <DIcon name="infinity" size={26} color={dc.dark} />
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: dc.mint, borderRadius: 22, padding: 5 },
  tab: { flex: 1, minHeight: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4 },
  tabOn: { backgroundColor: dc.dark },
  tabText: { fontFamily: fonts.semibold, fontSize: 13, color: dc.dark },
  tabTextOn: { color: '#FFFFFF' },
  panel: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: dc.border, overflow: 'hidden' },
  bigIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: dc.mint, alignItems: 'center', justifyContent: 'center' },
  panelTitle: { fontFamily: fonts.bold, fontSize: 22, color: dc.dark, textAlign: 'center' },
  panelText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: dc.muted, textAlign: 'center' },
  dateBand: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: dc.dark, paddingHorizontal: 18, paddingVertical: 14 },
  dateBandText: { fontFamily: fonts.semibold, fontSize: 16, color: '#FFFFFF' },
  dateBody: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  dateInput: { fontFamily: fonts.bold, fontSize: 36, color: dc.dark, textAlign: 'center', width: '100%', paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: dc.lime, outlineStyle: 'none' } as never,
  months: { flex: 1, padding: 10, gap: 8 },
  monthRow: { flex: 1, flexDirection: 'row', gap: 8 },
  month: { flex: 1, borderRadius: 16, backgroundColor: dc.mint, alignItems: 'center', justifyContent: 'center', gap: 2 },
  monthOn: { backgroundColor: dc.lime, borderWidth: 2, borderColor: dc.dark },
  monthNum: { fontFamily: fonts.regular, fontSize: 11, color: dc.muted },
  monthText: { fontFamily: fonts.semibold, fontSize: 17, color: dc.dark },
  monthTextOn: { fontFamily: fonts.bold },

  hero: { backgroundColor: dc.dark, borderRadius: 24, padding: 18, gap: 4 },
  heroKicker: { fontFamily: fonts.medium, fontSize: 13, letterSpacing: 0.4, color: 'rgba(255,255,255,0.75)' },
  heroValue: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: dc.lime },
  heroNote: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  stairs: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  stairCol: { flex: 1, justifyContent: 'flex-end', gap: 6 },
  step: { flexBasis: 0, minHeight: 44, borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, backgroundColor: dc.mintStrong, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 },
  stepOn: { backgroundColor: dc.lime, borderWidth: 2, borderColor: dc.dark },
  stepGlyph: { fontFamily: fonts.bold, fontSize: 18, color: dc.teal },
  stepCheck: { marginTop: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: dc.dark, alignItems: 'center', justifyContent: 'center' },
  stepLabel: { fontFamily: fonts.medium, fontSize: 12, color: dc.dark, textAlign: 'center' },
  flex: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: dc.border },
  flexOn: { borderWidth: 2, borderColor: dc.dark, backgroundColor: '#F7F9D8' },
  flexTitle: { fontFamily: fonts.bold, fontSize: 17, color: dc.dark },
  flexHint: { fontFamily: fonts.regular, fontSize: 13, color: dc.muted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#C9CDCB', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: dc.dark, borderColor: dc.dark },
});
