import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { authColors, fonts, homeColors } from '../theme/auth-theme';
import { DestinationCard } from './DestinationCard';

interface Props {
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onToggleSave: (id: string) => void;
  onCompare: () => void;
  onRestart: () => void;
  onEditAnswers: () => void;
}

/** Deck horizontal paginado: um destino por vez (arrastar ou usar Anterior/Próximo). */
export function ResultsDeck({ recs, favorites, onToggleSave, onCompare, onRestart, onEditAnswers }: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Recommendation>>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(recs.length - 1, i));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  }, [recs.length]);

  const onEnd = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  }, [width]);

  if (recs.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle} accessibilityRole="header">Nenhum destino coube no seu perfil</Text>
        <Text style={s.emptyText}>
          Combinamos origem, duração, orçamento e clima, e nada ficou viável. Tente aumentar os dias, ampliar o alcance ou ajustar o orçamento.
        </Text>
        <PrimaryButton title="Ajustar minhas respostas" onPress={onEditAnswers} />
        <SecondaryTextButton title="Recomeçar" onPress={onRestart} />
      </View>
    );
  }

  const favCount = favorites.size;
  return (
    <View style={s.root}>
      <FlatList
        ref={listRef}
        data={recs}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(r) => r.destination.id}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        onMomentumScrollEnd={onEnd}
        extraData={favorites}
        renderItem={({ item, index: i }) => (
          <DestinationCard rec={item} width={width} saved={favorites.has(item.destination.id)} position={`${i + 1} de ${recs.length}`} onToggleSave={onToggleSave} />
        )}
      />
      <View style={s.footer}>
        <View style={s.navRow}>
          <View style={s.navBtn}><SecondaryTextButton title="Anterior" onPress={() => goTo(index - 1)} /></View>
          <View style={s.navBtn}><SecondaryTextButton title="Próximo" onPress={() => goTo(index + 1)} /></View>
        </View>
        {favCount >= 2
          ? <PrimaryButton title={`Comparar favoritos (${favCount})`} onPress={onCompare} />
          : <Text style={s.hint}>Salve pelo menos 2 destinos para compará-los lado a lado.</Text>}
        <SecondaryTextButton title="Refazer perguntas" onPress={onRestart} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  footer: { paddingHorizontal: 22, paddingTop: 8, gap: 10, width: '100%', maxWidth: 524, alignSelf: 'center' },
  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: { flex: 1 },
  hint: { fontFamily: fonts.regular, fontSize: 13, textAlign: 'center', color: authColors.muted },
  empty: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: authColors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: homeColors.subtitle },
});
