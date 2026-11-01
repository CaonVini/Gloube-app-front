import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pickFavorites } from '../../domain/discover/compare';
import { recommend } from '../../domain/discover/matching';
import { STEPS, emptyAnswers, isStepComplete, progressFraction } from '../../domain/discover/quiz';
import type { Answers, Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { CompareScreen } from './CompareScreen';
import { QuizStepContent } from './QuizStepContent';
import { ResultsDeck } from './ResultsDeck';
import { ProgressBar } from './ui';

type Phase = 'quiz' | 'results' | 'compare';

/** Orquestra o fluxo: questionário → destinos (um por vez) → comparação. Estado 100% local (sem API). */
export function DiscoverFlow({ onExit }: { onExit: () => void }) {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());
  const [chosenId, setChosenId] = useState<string | null>(null);

  const step = STEPS[stepIndex]!;
  const patch = useCallback((p: Partial<Answers>) => setAnswers((prev) => ({ ...prev, ...p })), []);

  const next = useCallback(() => {
    if (stepIndex < STEPS.length - 1) { setStepIndex(stepIndex + 1); return; }
    setRecs(recommend(answers, undefined, today));
    setFavorites(new Set());
    setChosenId(null);
    setPhase('results');
  }, [stepIndex, answers, today]);

  const back = useCallback(() => (stepIndex === 0 ? onExit() : setStepIndex(stepIndex - 1)), [stepIndex, onExit]);

  const toggleSave = useCallback((id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const restart = useCallback(() => {
    setAnswers(emptyAnswers());
    setStepIndex(0);
    setPhase('quiz');
  }, []);
  const editAnswers = useCallback(() => { setStepIndex(STEPS.length - 1); setPhase('quiz'); }, []);

  const top = Math.max(insets.top, 47) + 8;
  const bottom = Math.max(insets.bottom, 16);

  if (phase === 'results') {
    return (
      <View style={[s.root, { paddingTop: top, paddingBottom: bottom }]}>
        <Text style={s.resultsTitle} accessibilityRole="header">Seus destinos</Text>
        <ResultsDeck recs={recs} favorites={favorites} onToggleSave={toggleSave} onCompare={() => setPhase('compare')} onRestart={restart} onEditAnswers={editAnswers} />
      </View>
    );
  }
  if (phase === 'compare') {
    return (
      <View style={[s.root, { paddingTop: top, paddingBottom: bottom }]}>
        <CompareScreen favorites={pickFavorites(recs, favorites)} chosenId={chosenId} onChoose={setChosenId} onBack={() => setPhase('results')} />
      </View>
    );
  }

  const complete = isStepComplete(step.id, answers, today);
  const last = stepIndex === STEPS.length - 1;
  return (
    <View style={[s.root, { paddingTop: top, paddingBottom: bottom }]}>
      <View style={s.column}>
        <View style={s.header}>
          <SecondaryTextButtonCompact title="Voltar" onPress={back} />
          <ProgressBar fraction={progressFraction(stepIndex)} label={`Etapa ${stepIndex + 1} de ${STEPS.length}`} />
          <Text style={s.count}>{stepIndex + 1}/{STEPS.length}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={[s.body, s.column]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={s.title} accessibilityRole="header">{step.title}</Text>
        {step.subtitle ? <Text style={s.subtitle}>{step.subtitle}</Text> : null}
        <View style={s.content}>
          <QuizStepContent step={step.id} answers={answers} onChange={patch} today={today} />
        </View>
      </ScrollView>
      <View style={[s.footer, s.column]}>
        <PrimaryButton title={last ? 'Ver destinos' : 'Continuar'} onPress={next} disabled={!complete} />
        {step.optional ? <SecondaryTextButton title="Pular" onPress={next} /> : null}
      </View>
    </View>
  );
}

function SecondaryTextButtonCompact({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={{ minWidth: 76 }}>
      <SecondaryTextButton title={title} onPress={onPress} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  column: { width: '100%', maxWidth: 524, alignSelf: 'center', paddingHorizontal: 22 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: authColors.muted },
  body: { paddingBottom: 20, gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: authColors.text, letterSpacing: -0.4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: homeColors.subtitle },
  content: { marginTop: 14 },
  footer: { gap: 10, paddingTop: 8 },
  resultsTitle: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: authColors.text, paddingHorizontal: 22, marginBottom: 8 },
});
