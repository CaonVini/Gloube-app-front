import { EMPTY_TRIP, buildReply, typingDelay } from '../src/domain/chat/aurora-replies';
import type { ChatMessage } from '../src/domain/chat/messages';

const text = (t: string): ChatMessage => ({ id: '1', author: 'user', at: 0, kind: 'text', text: t });
const paris = { destinations: ['Paris'], places: ['Torre Eiffel', 'Museu do Louvre', 'Montmartre', 'Jardim de Luxemburgo'] };

describe('buildReply', () => {
  it('usa destino e locais escolhidos no roteiro', () => {
    const r = buildReply(text('Monte meu roteiro'), paris);
    expect(r).toContain('Paris');
    expect(r).toContain('Torre Eiffel');
  });
  it('lista os locais escolhidos, resumindo o excedente', () => {
    expect(buildReply(text('Quais locais eu escolhi?'), paris)).toContain('e mais 1');
  });
  it('sem viagem, orienta a começar pelo Planeje', () => {
    expect(buildReply(text('monte meu roteiro'), EMPTY_TRIP)).toContain('Planeje');
    expect(buildReply(text('quais locais eu escolhi?'), EMPTY_TRIP)).toContain('ainda não escolheu');
  });
  it('"quanto tempo" não cai na resposta de clima', () => {
    expect(buildReply(text('Quanto tempo ficar?'), paris)).toContain('4 a 6 dias');
  });
  it('ignora acentos e maiúsculas', () => {
    expect(buildReply(text('ORÇAMENTO'), EMPTY_TRIP)).toContain('ilustrativos');
  });
  it('responde foto e áudio sem fingir que analisou o conteúdo', () => {
    expect(buildReply({ id: '2', author: 'user', at: 0, kind: 'image', uri: 'x', width: 1, height: 1 })).toContain('não analiso');
    expect(buildReply({ id: '3', author: 'user', at: 0, kind: 'audio', uri: 'x', durationMs: 1000 })).toContain('não transcrevo');
  });
  it('tem resposta padrão para texto desconhecido', () => {
    expect(buildReply(text('xyzzy'), paris)).toContain('Paris');
  });
});

describe('typingDelay', () => {
  it('fica entre 0,8 s e 2 s', () => {
    expect(typingDelay('a')).toBe(800);
    expect(typingDelay('a'.repeat(1000))).toBe(2000);
  });
});
