/** Perfil FICTÍCIO da demonstração (sem API). */
export interface ProfileStat { key: string; value: number; label: string }
export interface AccessPlan { title: string; subtitle: string; active: boolean }

export interface DemoProfile {
  name: string;
  email: string;
  stats: readonly ProfileStat[];
  plan: AccessPlan;
}

export const DEMO_PROFILE: DemoProfile = {
  name: 'Vinicius Caon',
  email: 'vinicius@email.com',
  stats: [
    { key: 'trips', value: 4, label: 'Viagens realizadas' },
    { key: 'countries', value: 3, label: 'Países visitados' },
    { key: 'places', value: 28, label: 'Lugares visitados' },
  ],
  plan: { title: 'Paris e Roma', subtitle: 'Plano Premium · Por viagem', active: true },
};

export const ACCOUNT_ITEMS = [
  { key: 'personal', label: 'Dados pessoais', icon: 'person' },
  { key: 'preferences', label: 'Preferências de viagem', icon: 'sliders' },
  { key: 'notifications', label: 'Notificações', icon: 'bell' },
  { key: 'help', label: 'Ajuda e suporte', icon: 'help' },
] as const;
export type AccountItem = (typeof ACCOUNT_ITEMS)[number];

/** Mensagem das ações ainda não implementadas (tudo é fictício nesta versão). */
export const COMING_SOON = 'Disponível em breve.';
