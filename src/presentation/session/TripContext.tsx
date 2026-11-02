import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { EMPTY_TRIP, type TripContext } from '../../domain/chat/aurora-replies';

interface Value {
  trip: TripContext;
  setTrip(t: TripContext): void;
}

const Ctx = createContext<Value>({ trip: EMPTY_TRIP, setTrip: () => {} });

/** Resumo da viagem em andamento (destino e locais escolhidos), só em memória: a Aurora usa para responder. */
export function TripContextProvider({ children }: { children: ReactNode }) {
  const [trip, setTrip] = useState<TripContext>(EMPTY_TRIP);
  const value = useMemo(() => ({ trip, setTrip }), [trip]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useTripContext = () => useContext(Ctx);
