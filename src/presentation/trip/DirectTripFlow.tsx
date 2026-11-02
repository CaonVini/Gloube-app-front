import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildTripPreview } from '../../domain/discover/choice';
import { selectedPlaces, suggestedDays } from '../../domain/discover/places';
import type { Destination } from '../../domain/trip-plan';
import { AppHeader } from '../home/AppHeader';
import { ItineraryScreen } from '../discover/ItineraryScreen';
import { PlacesScreen } from '../discover/PlacesScreen';
import { BottomNavBar, DEFAULT_NAV_ITEMS, useNavRouting } from '../navigation';
import { useTripContext } from '../session/TripContext';
import { homeColors } from '../theme/auth-theme';

interface Props {
  fullName: string;
  onSignOut: () => void;
  onExit: () => void;
  /** Destinos que a pessoa já definiu na tela Nova viagem: pula exploração/comparação/escolha. */
  destinations: readonly Destination[];
}

/** Destino já definido → direto para a escolha de locais e a prévia do roteiro. Tudo local/fictício. */
export function DirectTripFlow({ fullName, onSignOut, onExit, destinations }: Props) {
  const [phase, setPhase] = useState<'places' | 'itinerary'>('places');
  const [selection, setSelection] = useState<Readonly<Record<string, readonly string[]>>>({});
  const onNav = useNavRouting('plan');
  const { setTrip } = useTripContext();
  const targets = useMemo(() => destinations.map((d) => ({ id: d.id, name: d.city })), [destinations]);
  const previews = useMemo(() => destinations.map((d) => {
    const places = selectedPlaces(d.id, selection[d.id] ?? []);
    return buildTripPreview({ id: d.id, name: d.city, country: d.country, days: suggestedDays(places.length), places, suggestedDuration: true });
  }), [destinations, selection]);

  // Compartilha com a Aurora (só em memória) os destinos e locais escolhidos.
  useEffect(() => {
    setTrip({ destinations: destinations.map((d) => d.city), places: destinations.flatMap((d) => selectedPlaces(d.id, selection[d.id] ?? []).map((pl) => pl.name)) });
  }, [destinations, selection, setTrip]);

  return (
    <View style={s.root}>
      <View style={s.column}><AppHeader fullName={fullName} onSignOut={onSignOut} /></View>
      {phase === 'places'
        ? <PlacesScreen targets={targets} selection={selection} onChange={setSelection} onBack={onExit} onContinue={() => setPhase('itinerary')} />
        : <ItineraryScreen previews={previews} onEditPlaces={() => setPhase('places')} onDone={onExit} />}
      <BottomNavBar items={DEFAULT_NAV_ITEMS} activeKey="plan" onChange={onNav} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: homeColors.background },
  column: { width: '100%', maxWidth: 512, alignSelf: 'center', paddingHorizontal: 16 },
});
