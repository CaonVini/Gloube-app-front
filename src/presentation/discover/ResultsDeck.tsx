import { useCallback, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import type { Recommendation } from '../../domain/discover/types';
import { PrimaryButton } from '../auth-ui/Button';
import { SecondaryTextButton } from '../home/SecondaryTextButton';
import { fonts } from '../theme/auth-theme';
import { DestinationCard } from './DestinationCard';
import { DetailsSheet } from './DetailsSheet';
import { NAV_FAB_WIDTH } from '../navigation';
import { RoundButton, dc } from './ui';

interface Props {
  recs: readonly Recommendation[];
  favorites: ReadonlySet<string>;
  onToggleSave: (id: string) => void;
  onCompare: () => void;
  onRestart: () => void;
  onEditAnswers: () => void;
}

/** Deck horizontal paginado: um destino por vez (arrastar ou usar os botões). */
export function ResultsDeck({ recs, favorites, onToggleSave, onCompare, onRestart, onEditAnswers }: Props) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Recommendation>>(null);
  const [index, setIndex] = useState(0);
  const [detail, setDetail] = useState<Recommendation | null>(null);

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
        <PrimaryButton title="Ajustar minhas respostas" onPress={onEditAnswers} size="hero" />
        <SecondaryTextButton title="Recomeçar" onPress={onRestart} />
      </View>
    );
  }

  const favCount = favorites.size;
  const last = index >= recs.length - 1;
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
          <DestinationCard rec={item} width={width} saved={favorites.has(item.destination.id)} position={`${i + 1} de ${recs.length} destinos`} onToggleSave={onToggleSave} onDetails={setDetail} />
        )}
      />
      {/* Rodapé dividido ao redor da bola central da navbar: voltar + contagem à esquerda, ação à direita. */}
      <View style={s.footer}>
        <View style={s.footSide}>
          <RoundButton icon="chevronLeft" label="Destino anterior" onPress={() => goTo(index - 1)} disabled={index === 0} />
          <View style={s.flex}>
            <Text style={s.count} accessibilityLiveRegion="polite" numberOfLines={1}>
              {favCount === 0 ? '♡ salvar' : favCount === 1 ? '1 salvo' : `${favCount} salvos`}
            </Text>
          </View>
        </View>
        <View style={{ width: NAV_FAB_WIDTH }} />
        <View style={s.footSide}>
          <View style={s.flex}>
            {last
              ? <PrimaryButton title="Comparar e escolher" onPress={onCompare} size="half" />
              : <PrimaryButton title="Próximo" onPress={() => goTo(index + 1)} size="half" />}
          </View>
        </View>
      </View>
      <DetailsSheet rec={detail} onClose={() => setDetail(null)} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6, width: '100%', maxWidth: 512, alignSelf: 'center' },
  footSide: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { fontFamily: fonts.medium, fontSize: 13, color: dc.muted },
  countLink: { fontFamily: fonts.bold, fontSize: 14, color: dc.teal, paddingVertical: 2 },
  empty: { flex: 1, justifyContent: 'center', padding: 22, gap: 14 },
  emptyTitle: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32, color: dc.dark },
  emptyText: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: dc.muted },
});
