import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { BackCard, DestinationCard } from './DestinationCard';
import { DetailsSheet } from './DetailsSheet';
import { SwipeDeck } from './SwipeDeck';
import { dc } from './ui';

interface Props {
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  /** gostei (favorita) / não gostei (só avança). */
  onReact: (id: string, liked: boolean) => void;
  onCompare: () => void;
  onRestart: () => void;
  onEditAnswers: () => void;
}

/** Pilha de destinos estilo Tinder (gostei / não gostei); ao fim vai para a comparação. */
export function ResultsDeck({ recs, favorites, onReact, onCompare, onRestart, onEditAnswers }: Props) {
  const [detail, setDetail] = useState<Recommendation | null>(null);
  if (recs.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle} accessibilityRole="header">Nenhum destino coube no seu perfil</Text>
        <Text style={s.emptyText}>
          Combinamos origem, duração, orçamento e clima, e nada ficou viável. Tente aumentar os dias, ampliar o alcance ou ajustar o orçamento.
        </Text>
        <PrimaryButton title="Ajustar minhas respostas" onPress={onEditAnswers} size="hero" />
        <SecondaryTextButton title="Recomeçar" onPress={onRestart} />
      </View>
    );
  }
  const fav = favorites.size;
  return (
    <>
      <SwipeDeck
        items={recs}
        keyOf={(r) => r.destination.id}
        renderFront={(r, w, h) => <DestinationCard rec={r} width={w} height={h} onDetails={setDetail} />}
        renderBack={(r, w, h) => <BackCard rec={r} width={w} height={h} />}
        onReact={(r, liked) => onReact(r.destination.id, liked)}
        onFinish={onCompare}
        positionText={(i, n) => `${i + 1} de ${n} destinos${fav > 0 ? `  ·  ${fav} ${fav === 1 ? 'curtido' : 'curtidos'}` : ''}`}
        likeLabel="Gostei, salvar nos favoritos e ver o próximo"
        nopeLabel="Não gostei, próximo destino"
      />
      <DetailsSheet rec={detail} onClose={() => setDetail(null)} />
    </>
  );
}

const s = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: dc.dark },
  emptyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: dc.muted },
});
