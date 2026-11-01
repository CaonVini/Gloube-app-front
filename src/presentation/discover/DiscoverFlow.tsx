import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { applyReaction, buildTripPreview, orderForChoice } from '../../domain/discover/choice';
import { selectedPlaces } from '../../domain/discover/places';
import { recommend } from '../../domain/discover/matching';
import { emptyAnswers, finalizeAnswers, isStepComplete, visibleSteps } from '../../domain/discover/quiz';
import type { Answers, Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { BottomNavBar, DEFAULT_NAV_ITEMS } from '../navigation';
import { fonts, homeColors } from '../theme/auth-theme';
import { ChooseScreen } from './ChooseScreen';
import { ItineraryScreen } from './ItineraryScreen';
import { PlacesScreen } from './PlacesScreen';
import { QuizStepContent } from './QuizStepContent';
import { ResultsDeck } from './ResultsDeck';
import { DiscoverHeader, RoundButton, SegmentedProgress, StepTitle, dc } from './ui';

type Phase = 'quiz' | 'results' | 'choose' | 'places' | 'itinerary';

const noop = () => {};

interface Props {
  fullName: string;
  onSignOut: () => void;
  onExit: () => void;
  /** Texto de "Onde estamos?" da tela Nova viagem; define a origem do ranking. */
  originText?: string;
}

/** Orquestra o fluxo: questionário → destinos (um por vez) → comparação. Estado 100% local (sem API). */
export function DiscoverFlow({ fullName, onSignOut, onExit, originText }: Props) {
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(() => emptyAnswers(originText));
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [favorites, setFavorites] = useState<ReadonlySet<string>>(new Set());
  const [chosen, setChosen] = useState<Recommendation | null>(null);
  const [placeSel, setPlaceSel] = useState<Readonly<Record<string, readonly string[]>>>({});
  const [showHint, setShowHint] = useState(false);

  const steps = useMemo(() => visibleSteps(answers), [answers]);
  const step = steps[Math.min(stepIndex, steps.length - 1)]!;
  const complete = isStepComplete(step.id, answers, today);
  const patch = useCallback((p: Partial<Answers>) => { setShowHint(false); setAnswers((prev) => ({ ...prev, ...p })); }, []);

  const next = useCallback(() => {
    if (!complete) { setShowHint(true); return; }
    setShowHint(false);
    if (stepIndex < steps.length - 1) { setStepIndex(stepIndex + 1); return; }
    setRecs(recommend(finalizeAnswers(answers), undefined, today));
    setFavorites(new Set());
    setChosen(null);
    setPhase('results');
  }, [complete, stepIndex, steps, answers, today]);
  const skip = useCallback(() => {
    setShowHint(false);
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
  }, [stepIndex, steps]);

  const back = useCallback(() => {
    setShowHint(false);
    if (stepIndex === 0) onExit(); else setStepIndex(stepIndex - 1);
  }, [stepIndex, onExit]);

  const react = useCallback((id: string, liked: boolean) => setFavorites((prev) => applyReaction(prev, id, liked)), []);

  const restart = useCallback(() => { setAnswers(emptyAnswers(originText)); setStepIndex(0); setPhase('quiz'); }, []);
  const editAnswers = useCallback(() => { setStepIndex(steps.length - 1); setPhase('quiz'); }, [steps]);

  const shell = (children: React.ReactNode, withNav = true) => (
    <View style={s.root}>
      <View style={s.column}>
        <DiscoverHeader fullName={fullName} onSignOut={onSignOut} />
      </View>
      {children}
      {/* Navegação fictícia: "Descubra" ativo. Fica de fora do questionário para dar espaço aos cards (sem rolagem). */}
      {withNav ? <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="discover" onChange={noop} /> : <View style={{ height: Math.max(insets.bottom, 12) }} />}
    </View>
  );

  if (phase === 'results') {
    return shell(
      <View style={s.flex}>
        <View style={[s.column, s.resultsHead]}>
          <Text style={s.resultsTitle} accessibilityRole="header">Seus destinos</Text>
          <Text style={s.compareLink} accessibilityRole="button" accessibilityLabel="Comparar destinos" onPress={() => setPhase('choose')}>Comparar destinos</Text>
        </View>
        <ResultsDeck recs={recs} favorites={favorites} onReact={react} onCompare={() => setPhase('choose')} onRestart={restart} onEditAnswers={editAnswers} />
      </View>,
    );
  }
  if (phase === 'choose') {
    return shell(
      <ChooseScreen
        recs={orderForChoice(recs, favorites)}
        favorites={favorites}
        onBack={() => setPhase('results')}
        onAdjust={editAnswers}
        onConfirm={(r) => { setChosen(r); setPhase('places'); }}
      />,
      false,
    );
  }
  if (phase === 'places' && chosen) {
    return shell(
      <PlacesScreen
        targets={[{ id: chosen.destination.id, name: chosen.destination.name }]}
        selection={placeSel}
        onChange={setPlaceSel}
        onBack={() => setPhase('choose')}
        onContinue={() => setPhase('itinerary')}
      />,
      false,
    );
  }
  if (phase === 'itinerary' && chosen) {
    const d = chosen.destination;
    const fin = finalizeAnswers(answers);
    const preview = buildTripPreview({ id: d.id, name: d.name, country: d.country, days: fin.days, places: selectedPlaces(d.id, placeSel[d.id] ?? []), period: fin.period, companion: fin.companion, needs: fin.needs });
    return shell(
      <ItineraryScreen previews={[preview]} onEditPlaces={() => setPhase('places')} onBackToChoice={() => setPhase('choose')} onDone={onExit} />,
      true,
    );
  }
  const last = stepIndex === steps.length - 1;
  const selectedCount = step.id === 'experiencias' ? answers.experiences.length : step.id === 'cuidados' ? answers.needs.length : 0;
  const meta = selectedCount > 0
    ? `${selectedCount} ${selectedCount === 1 ? 'selecionado' : 'selecionados'}`
    : showHint ? 'Escolha uma opção para continuar.' : '';
  return shell(
    <>
      <View style={[s.column, s.stepHead]}>
        <SegmentedProgress kicker="DESCUBRA" current={stepIndex + 1} total={steps.length} />
        <StepTitle title={step.title} subtitle={step.subtitle} />
      </View>
      <ScrollView
        style={s.flex}
        contentContainerStyle={[s.body, s.column]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <QuizStepContent step={step.id} answers={answers} onChange={patch} today={today} />
      </ScrollView>
      <View style={[s.column, s.footer]}>
        <View style={s.metaRow}>
          <Text style={[s.meta, showHint && selectedCount === 0 && s.metaWarn]} accessibilityLiveRegion="polite" accessibilityRole={showHint ? 'alert' : undefined}>{meta}</Text>
          {step.optional ? <Text style={s.skip} accessibilityRole="button" accessibilityLabel="Pular esta etapa" onPress={skip}>Pular</Text> : null}
        </View>
        <View style={s.footRow}>
          <RoundButton icon="chevronLeft" label="Voltar" onPress={back} />
          <View style={s.flex}><PrimaryButton title={last ? 'Ver destinos' : 'Continuar'} onPress={next} size="hero" /></View>
        </View>
      </View>
    </>,
    false,
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  flex: { flex: 1 },
  column: { width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
  stepHead: { paddingBottom: 12 },
  body: { flexGrow: 1, paddingBottom: 6 },
  footer: { gap: 8, paddingTop: 6, paddingBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 22 },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: dc.muted },
  metaWarn: { color: '#8A6100' },
  skip: { fontFamily: fonts.bold, fontSize: 15, color: dc.teal, paddingVertical: 6, paddingHorizontal: 4 },
  footRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultsHead: { marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareLink: { fontFamily: fonts.bold, fontSize: 15, color: dc.teal, paddingVertical: 6, paddingHorizontal: 4 },
  resultsTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, color: '#0B0B0B' },
});
