import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { KIND_LABEL, type Place, type PlaceKind } from '../../domain/discover/places';
import { fonts } from '../theme/auth-theme';
import { destinationImages, placeImages } from './assets';
import { DIcon, type DiscoverIconName } from './icons';
import { cardShadow, dc } from './ui';

const TONES: Record<PlaceKind, readonly [string, string]> = {
  icone: ['#2F6B5E', '#12302A'],
  museu: ['#3C4A6B', '#1A2236'],
  natureza: ['#4F8F62', '#173225'],
  passeio: ['#1B7F8C', '#12303A'],
  sabor: ['#B5683A', '#432A1D'],
  bairro: ['#6B5B8A', '#231F38'],
};
const GLYPH: Record<PlaceKind, DiscoverIconName> = { icone: 'pin', museu: 'home', natureza: 'sun', passeio: 'world', sabor: 'heart', bairro: 'pin' };

function mix(a: string, b: string, t: number): string {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = (i: number) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t);
  return `rgb(${c(0)},${c(1)},${c(2)})`;
}

interface Props {
  place: Place;
  destinationId: string;
  /** Nome do destino, mostrado só quando a viagem tem mais de um. */
  destinationName?: string;
  width: number;
  height: number;
}

/** Card de um local: foto grande (do local, do destino ou fundo de cor), tag, nome e frase curta. */
export const PlaceCard = memo(function PlaceCard({ place, destinationId, destinationName, width, height }: Props) {
  const photo = placeImages[place.id] ?? destinationImages[destinationId];
  const [from, to] = TONES[place.kind];
  return (
    <View style={[s.card, cardShadow, { width, height }]}>
      <View style={s.photo}>
        {photo ? (
          <Image source={photo} style={s.img} resizeMode="cover" accessibilityRole="image" accessibilityLabel={`Imagem de ${place.name}`} />
        ) : (
          <View style={s.tone} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {Array.from({ length: 16 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: mix(from, to, i / 15) }} />)}
            <View style={s.glyph}><DIcon name={GLYPH[place.kind]} size={Math.min(150, height * 0.4)} color="rgba(255,255,255,0.16)" /></View>
          </View>
        )}
        <View pointerEvents="none" style={s.shade}>
          {Array.from({ length: 18 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: `rgba(8,24,20,${(0.7 * Math.pow((i + 1) / 18, 1.9)).toFixed(3)})` }} />)}
        </View>
        <View pointerEvents="none" style={s.tag}><Text style={s.tagText}>{KIND_LABEL[place.kind]}</Text></View>
        {destinationName ? <View pointerEvents="none" style={s.dest}><Text style={s.destText} numberOfLines={1}>{destinationName}</Text></View> : null}
        <View pointerEvents="none" style={s.overlay}>
          <Text style={s.name} numberOfLines={3} accessibilityRole="header">{place.name}</Text>
        </View>
      </View>
      <View style={s.panel}>
        <Text style={s.blurb} numberOfLines={2}>{place.blurb}</Text>
        <Text style={s.note} numberOfLines={1}>Horários e valores: confirme antes de ir.</Text>
      </View>
    </View>
  );
});

export const PlaceBackCard = memo(function PlaceBackCard({ place, destinationId, width, height }: Props) {
  const photo = placeImages[place.id] ?? destinationImages[destinationId];
  const [from, to] = TONES[place.kind];
  return (
    <View style={[s.card, { width, height }]} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {photo ? <Image source={photo} style={s.img} resizeMode="cover" /> : <View style={[s.img, { backgroundColor: mix(from, to, 0.5) }]} />}
      <View style={s.dim} />
    </View>
  );
});

/** Miniatura com foto para o resumo: foto, tipo, nome e um X discreto para remover. */
export const PlaceTile = memo(function PlaceTile({ place, destinationId, destinationName, height, onRemove }: { place: Place; destinationId: string; destinationName?: string; height: number; onRemove: () => void }) {
  const photo = placeImages[place.id] ?? destinationImages[destinationId];
  const [from, to] = TONES[place.kind];
  return (
    <View style={[s.tile, cardShadow, { height }]}>
      {photo ? (
        <Image source={photo} style={s.img} resizeMode="cover" accessibilityLabel={`Imagem de ${place.name}`} />
      ) : (
        <View style={s.tone} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: 12 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: mix(from, to, i / 11) }} />)}
          <View style={s.glyph}><DIcon name={GLYPH[place.kind]} size={Math.min(84, height * 0.5)} color="rgba(255,255,255,0.16)" /></View>
        </View>
      )}
      <View pointerEvents="none" style={[s.shade, { height: '70%' }]}>
        {Array.from({ length: 14 }, (_, i) => <View key={i} style={{ flex: 1, backgroundColor: `rgba(8,24,20,${(0.78 * Math.pow((i + 1) / 14, 1.8)).toFixed(3)})` }} />)}
      </View>
      <View pointerEvents="none" style={s.tileText}>
        <Text style={s.tileKind} numberOfLines={1}>{KIND_LABEL[place.kind]}{destinationName ? ` · ${destinationName.toUpperCase()}` : ''}</Text>
        <Text style={s.tileName} numberOfLines={2}>{place.name}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${place.name} do roteiro`} onPress={onRemove} hitSlop={6} style={({ pressed }) => [s.tileX, pressed && { opacity: 0.8 }]}>
        <View style={[s.xBar, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[s.xBar, { transform: [{ rotate: '-45deg' }] }]} />
      </Pressable>
    </View>
  );
});

const s = StyleSheet.create({
  card: { borderRadius: 26, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  photo: { flex: 1, minHeight: 120, backgroundColor: dc.dark },
  img: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  tone: { ...StyleSheet.absoluteFill },
  glyph: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
  dim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(248,245,240,0.35)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  tag: { position: 'absolute', left: 14, top: 14, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 5 },
  tagText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.1, color: dc.dark },
  dest: { position: 'absolute', right: 14, top: 14, maxWidth: '45%', backgroundColor: 'rgba(31,61,54,0.82)', borderRadius: 14, paddingHorizontal: 11, paddingVertical: 5 },
  destText: { fontFamily: fonts.semibold, fontSize: 11, color: '#FFFFFF' },
  overlay: { position: 'absolute', left: 16, right: 16, bottom: 14 },
  name: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 32, letterSpacing: -0.7, color: '#FFFFFF' },
  panel: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, gap: 6, backgroundColor: '#FFFFFF' },
  blurb: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: '#2B2F2E' },
  tile: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: dc.dark },
  tileText: { position: 'absolute', left: 12, right: 12, bottom: 10, gap: 1 },
  tileKind: { fontFamily: fonts.medium, fontSize: 9, letterSpacing: 1.3, color: 'rgba(255,255,255,0.85)' },
  tileName: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 19, letterSpacing: -0.2, color: '#FFFFFF' },
  tileX: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' },
  xBar: { position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: dc.dark },
  note: { fontFamily: fonts.regular, fontSize: 12, color: dc.muted },
});
