import type { Destination } from './types';

const unknown = { verified: false, allowed: false } as const;

/**
 * Catálogo FICTÍCIO (placeholder, sem API). Valores de custo, meses e cuidados são ilustrativos.
 * `pets`/`accessibility` só valem como promessa quando `verified: true` — preencher com fonte real no futuro.
 */
export const DESTINATIONS: readonly Destination[] = [
  {
    id: 'maldivas', name: 'Maldivas', country: 'Maldivas', domestic: false, zone: 'asia',
    description: 'Praias tranquilas, mar transparente e dias sem pressa.',
    climate: 'calor', experiences: ['praia', 'natureza'], suits: ['casal', 'familia'],
    kidFriendly: false, seniorFriendly: true, dailyCost: 1200, minDays: 6, bestMonths: [11, 12, 1, 2, 3, 4],
    pets: { verified: true, allowed: false, note: 'Resorts costumam não aceitar pets.' }, accessibility: unknown,
  },
  {
    id: 'noronha', name: 'Fernando de Noronha', country: 'Brasil', domestic: true, zone: 'nordeste',
    description: 'Ilha de águas cristalinas, mergulho e trilhas com vista para o mar.',
    climate: 'calor', experiences: ['praia', 'natureza'], suits: ['casal', 'amigos', 'solo'],
    kidFriendly: false, seniorFriendly: false, dailyCost: 900, minDays: 4, bestMonths: [8, 9, 10, 11, 12, 1],
    pets: { verified: true, allowed: false, note: 'Ilha de preservação: regras restritas para animais.' }, accessibility: unknown,
  },
  {
    id: 'gramado', name: 'Gramado', country: 'Brasil', domestic: true, zone: 'sul',
    description: 'Serra gaúcha com clima fresco, chocolate quente e passeios charmosos.',
    climate: 'frio', experiences: ['montanha', 'cidade'], suits: ['casal', 'familia', 'amigos'],
    kidFriendly: true, seniorFriendly: true, dailyCost: 450, minDays: 3, bestMonths: [5, 6, 7, 8, 12],
    pets: { verified: true, allowed: true, note: 'Muitas pousadas aceitam pets, sob consulta.' }, accessibility: unknown,
  },
  {
    id: 'jericoacoara', name: 'Jericoacoara', country: 'Brasil', domestic: true, zone: 'nordeste',
    description: 'Dunas, lagoas e pôr do sol na praia, com clima leve e descontraído.',
    climate: 'calor', experiences: ['praia', 'natureza'], suits: ['amigos', 'solo', 'casal'],
    kidFriendly: false, seniorFriendly: false, dailyCost: 400, minDays: 4, bestMonths: [7, 8, 9, 10, 11, 12],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'bariloche', name: 'Bariloche', country: 'Argentina', domestic: false, zone: 'america-sul',
    description: 'Lagos e montanhas nevadas, com esqui, chocolate e paisagens de cartão-postal.',
    climate: 'frio', experiences: ['neve', 'montanha', 'natureza'], suits: ['amigos', 'familia', 'casal'],
    kidFriendly: true, seniorFriendly: false, dailyCost: 550, minDays: 5, bestMonths: [6, 7, 8, 9],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'lisboa', name: 'Lisboa', country: 'Portugal', domestic: false, zone: 'europa',
    description: 'Ladeiras, miradouros, pastéis de nata e cultura em uma cidade acolhedora.',
    climate: 'ameno', experiences: ['cidade'], suits: ['casal', 'solo', 'amigos', 'familia'],
    kidFriendly: true, seniorFriendly: true, dailyCost: 500, minDays: 6, bestMonths: [4, 5, 6, 9, 10],
    pets: unknown, accessibility: { verified: true, allowed: false, note: 'Relevo com muitas ladeiras e calçadas irregulares.' },
  },
  {
    id: 'chapada', name: 'Chapada dos Veadeiros', country: 'Brasil', domestic: true, zone: 'centro-oeste',
    description: 'Cachoeiras, cânions e trilhas no coração do cerrado.',
    climate: 'ameno', experiences: ['natureza', 'montanha'], suits: ['amigos', 'solo', 'casal'],
    kidFriendly: false, seniorFriendly: false, dailyCost: 300, minDays: 3, bestMonths: [5, 6, 7, 8, 9],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'rio', name: 'Rio de Janeiro', country: 'Brasil', domestic: true, zone: 'sudeste',
    description: 'Praias icônicas, montanhas na cidade e muita energia o ano todo.',
    climate: 'calor', experiences: ['praia', 'cidade', 'natureza'], suits: ['casal', 'amigos', 'familia', 'solo'],
    kidFriendly: true, seniorFriendly: true, dailyCost: 450, minDays: 3, bestMonths: [4, 5, 9, 10, 11],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'santiago', name: 'Santiago e Andes', country: 'Chile', domestic: false, zone: 'america-sul',
    description: 'Cidade vibrante aos pés da cordilheira, com neve a poucas horas de distância.',
    climate: 'frio', experiences: ['neve', 'montanha', 'cidade'], suits: ['amigos', 'casal', 'familia', 'solo'],
    kidFriendly: true, seniorFriendly: false, dailyCost: 400, minDays: 5, bestMonths: [6, 7, 8, 9],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'cancun', name: 'Cancún', country: 'México', domestic: false, zone: 'america-central',
    description: 'Mar caribenho, resorts e ruínas maias a um passeio de distância.',
    climate: 'calor', experiences: ['praia', 'natureza', 'cidade'], suits: ['casal', 'familia', 'amigos'],
    kidFriendly: true, seniorFriendly: true, dailyCost: 600, minDays: 6, bestMonths: [11, 12, 1, 2, 3, 4],
    pets: unknown, accessibility: unknown,
  },
  {
    id: 'campos', name: 'Campos do Jordão', country: 'Brasil', domestic: true, zone: 'sudeste',
    description: 'Clima de montanha, lareira e passeios tranquilos para um fim de semana.',
    climate: 'frio', experiences: ['montanha', 'natureza'], suits: ['casal', 'familia', 'amigos'],
    kidFriendly: true, seniorFriendly: true, dailyCost: 420, minDays: 2, bestMonths: [5, 6, 7, 8],
    pets: { verified: true, allowed: true, note: 'Várias hospedagens pet friendly, sob consulta.' }, accessibility: unknown,
  },
  {
    id: 'bonito', name: 'Bonito', country: 'Brasil', domestic: true, zone: 'centro-oeste',
    description: 'Rios cristalinos, flutuação e grutas em meio à natureza preservada.',
    climate: 'calor', experiences: ['natureza'], suits: ['familia', 'amigos', 'casal'],
    kidFriendly: true, seniorFriendly: false, dailyCost: 450, minDays: 4, bestMonths: [4, 5, 6, 7, 8, 9],
    pets: unknown, accessibility: unknown,
  },
];
