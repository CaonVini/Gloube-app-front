import { ACCOUNT_ITEMS, DEMO_PROFILE } from '../src/domain/profile';

describe('DEMO_PROFILE', () => {
  it('tem as 3 estatísticas do mockup, com chaves únicas', () => {
    expect(DEMO_PROFILE.stats.map((s) => s.value)).toEqual([4, 3, 28]);
    expect(new Set(DEMO_PROFILE.stats.map((s) => s.key)).size).toBe(3);
  });
  it('lista os atalhos da conta na ordem do mockup', () => {
    expect(ACCOUNT_ITEMS.map((i) => i.label)).toEqual(['Dados pessoais', 'Preferências de viagem', 'Notificações', 'Ajuda e suporte']);
  });
});
