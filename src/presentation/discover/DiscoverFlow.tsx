import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pickFavorites } from '../../domain/discover/compare';
import { recommend } from '../../domain/discover/matching';
import { STEPS, emptyAnswers, isStepComplete } from '../../domain/discover/quiz';
import type { Answers, Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { BottomNavBar, DEFAULT_NAV_ITEMS } from '../navigation';
import { fonts, homeColors } from '../theme/auth-theme';
import { CompareScreen } from './CompareScreen';
import { QuizStepContent } from './QuizStepContent';
import { ResultsDeck } from './ResultsDeck';
import { DiscoverHeader, RoundButton, SegmentedProgress, StepTitle, dc } from './ui';

type Phase = 'quiz' | 'results' | 'compare';

const noop = () => {};

interface Props {
  fullName: string;
  onSignOut: () => void;
  onExit: () => void;
}

/** Orquestra o fluxo: questionário → destinos (um por vez) → comparação. Estado 100% local (sem API). */
export function DiscoverFlow({ fullName, onSignOut, onExit }: Props) {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const step = STEPS[stepIndex]!;
  const complete = isStepComplete(step.id, answers, today);
  const patch = useCallback((p: Partial<Answers>) => { setShowHint(false); setAnswers((prev) => ({ ...prev, ...p })); }, []);

  const next = useCallback(() => {
    if (!complete) { setShowHint(true); return; }
    setShowHint(false);
    if (stepIndex < STEPS.length - 1) { setStepIndex(stepIndex + 1); return; }
    setRecs(recommend(answers, undefined, today));
    setFavorites(new Set());
    setChosenId(null);
    setPhase('results');
  }, [complete, stepIndex, answers, today]);
  const skip = useCallback(() => {
    setShowHint(false);
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }, [stepIndex]);

  const back = useCallback(() => {
    setShowHint(false);
    if (stepIndex === 0) onExit(); else setStepIndex(stepIndex - 1);
  }, [stepIndex, onExit]);

  const toggleSave = useCallback((id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const restart = useCallback(() => { setAnswers(emptyAnswers()); setStepIndex(0); setPhase('quiz'); }, []);
  const editAnswers = useCallback(() => { setStepIndex(STEPS.length - 1); setPhase('quiz'); }, []);

  const top = Math.max(insets.top, 47) + 6;
  const shell = (children: React.ReactNode) => (
    <View style={s.root}>
      <View style={[s.column, { paddingTop: top }]}>
        <DiscoverHeader fullName={fullName} onSignOut={onSignOut} />
      </View>
      {children}
      {/* Navegação fictícia: "Descubra" ativo, como na tela Nova viagem. */}
      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="discover" onChange={noop} />
    </View>
  );

  if (phase === 'results') {
    return shell(
      <View style={s.flex}>
        <View style={[s.column, s.resultsHead]}>
          <Text style={s.resultsTitle} accessibilityRole="header">Seus destinos</Text>
        </View>
        <ResultsDeck recs={recs} favorites={favorites} onToggleSave={toggleSave} onCompare={() => setPhase('compare')} onRestart={restart} onEditAnswers={editAnswers} />
      </View>,
    );
  }
  if (phase === 'compare') {
    return shell(
      <CompareScreen favorites={pickFavorites(recs, favorites)} chosenId={chosenId} onChoose={setChosenId} onBack={() => setPhase('results')} />,
    );
  }

  const last = stepIndex === STEPS.length - 1;
  const selectedCount = step.id === 'experiencias' ? answers.experiences.length : step.id === 'cuidados' ? answers.needs.length : 0;
  return shell(
    <>
      <View style={[s.column, s.stepHead]}>
        <SegmentedProgress kicker="DESCUBRA" current={stepIndex + 1} total={STEPS.length} />
      </View>
      <ScrollView style={s.flex} contentContainerStyle={[s.body, s.column]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <StepTitle title={step.title} subtitle={step.subtitle} />
        <View style={s.content}>
          <QuizStepContent step={step.id} answers={answers} onChange={patch} today={today} />
        </View>
      </ScrollView>
      <View style={[s.column, s.footer]}>
        {selectedCount > 0 ? (
          <View style={s.countBar}>
            <Text style={s.count} accessibilityLiveRegion="polite">{selectedCount} {selectedCount === 1 ? 'selecionado' : 'selecionados'}</Text>
          </View>
        ) : showHint ? (
          <Text style={s.hint} accessibilityRole="alert">Escolha uma opção para continuar.</Text>
        ) : null}
        <View style={s.footRow}>
          <RoundButton icon="chevronLeft" label="Voltar" onPress={back} />
          <View style={s.flex}><PrimaryButton title={last ? 'Ver destinos' : 'Continuar'} onPress={next} size="hero" /></View>
        </View>
        {step.optional ? <SecondaryTextButton title="Pular esta etapa" onPress={skip} /> : null}
      </View>
    </>,
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  flex: { flex: 1 },
  column: { width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  stepHead: { paddingBottom: 2 },
  body: { paddingBottom: 20 },
  content: { marginTop: 20 },
  footer: { gap: 10, paddingTop: 10, paddingBottom: 12 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  countBar: { backgroundColor: dc.mint, borderRadius: 16, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  count: { fontFamily: fonts.medium, fontSize: 15, color: dc.muted },
  hint: { fontFamily: fonts.medium, fontSize: 14, color: '#8A6100', textAlign: 'center' },
  resultsHead: { marginBottom: 10 },
  resultsTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.8, color: '#0B0B0B' },
});
