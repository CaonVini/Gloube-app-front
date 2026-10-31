import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavBar, DEFAULT_NAV_ITEMS } from '../navigation';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from './SecondaryTextButton';
import { authColors, fonts, homeColors } from '../theme/auth-theme';

const TAB_TEXT: Record<string, { title: string; text: string }> = {
  discover: { title: 'Descubra', text: 'Em breve você vai encontrar destinos e inspirações por aqui.' },
  plan: { title: 'Planejador de viagem', text: 'Em breve a Aurora vai montar o seu roteiro por aqui.' },
  aurora: { title: 'Aurora', text: 'Em breve você vai conversar com a Aurora por aqui.' },
  trip: { title: 'Viagem', text: 'Em breve você vai acompanhar a sua viagem por aqui.' },
  wallet: { title: 'Carteira', text: 'Em breve você vai guardar seus documentos e reservas por aqui.' },
};

/** Placeholder do planejador de viagens. A navbar é fictícia: só troca o texto da aba ativa (sem rotas). Na aba Descubra, o botão abre o fluxo `/discover`. */
export function PlannerPlaceholderScreen({ onBack, onDiscover }: { onBack: () => void; onDiscover: () => void }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('plan');
  const content = TAB_TEXT[tab] ?? TAB_TEXT.plan!;
  return (
    <View style={s.root}>
      <View style={[s.main, { paddingTop: Math.max(insets.top, 47) + 20 }]}>
        <View style={s.body}>
          <Text style={s.title} accessibilityRole="header">{content.title}</Text>
          <Text style={s.text}>{content.text}</Text>
          {tab === 'discover' ? <PrimaryButton title="Descubra um destino" onPress={onDiscover} size="hero" /> : null}
        </View>
        <SecondaryTextButton title="Voltar" onPress={onBack} />
      </View>
      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey={tab} onChange={setTab} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  main: { flex: 1, paddingHorizontal: 22, paddingBottom: 20 },
  body: { flex: 1, justifyContent: 'center', gap: 10 },
  title: { fontFamily: fonts.bold, fontSize: 32, lineHeight: 38, color: authColors.text, letterSpacing: -0.5 },
  text: { fontFamily: fonts.regular, fontSize: 18, lineHeight: 26, color: homeColors.subtitle },
});
