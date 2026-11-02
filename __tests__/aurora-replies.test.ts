import { EMPTY_TRIP, buildReply, typingDelay } from '../src/domain/chat/aurora-replies';
import type { ChatMessage } from '../src/domain/chat/messages';

const text = (t: string): ChatMessage => ({ id: '1', author: 'user', at: 0, kind: 'text', text: t });
const paris = { destinations: ['Paris'], places: ['Torre Eiffel'] };

describe('buildReply', () => {
  it('não monta roteiro: explica e orienta a aba Roteiro', () => {
    for (const t of ['Monte meu roteiro', 'me faz um itinerário', 'quero organizar os dias']) {
      const r = buildReply(text(t), paris);
      expect(r).toContain('aba Roteiro');
      expect(r).toContain('não monto roteiros');
    }
  });
  it('responde os temas de dúvida (documentos, clima, moeda, transporte, segurança, comida)', () => {
    const qs = ['Preciso de visto ou documentos?', 'Como costuma ser o clima?', 'Qual moeda levar?', 'Como me locomover por lá?', 'É seguro viajar?', 'O que comer na região?'];
    const replies = qs.map((q) => buildReply(text(q), EMPTY_TRIP));
    expect(new Set(replies).size).toBe(qs.length);
    replies.forEach((r) => expect(r).not.toContain('não monto'));
  });
  it('usa o destino quando existe', () => {
    expect(buildReply(text('Como costuma ser o clima?'), paris)).toContain('Paris');
    expect(buildReply(text('Preciso de visto ou documentos?'), paris)).toContain('para Paris');
  });
  it('não afirma preços/regras: recomenda fontes oficiais', () => {
    expect(buildReply(text('visto'), EMPTY_TRIP)).toContain('fontes oficiais');
  });
  it('ignora acentos e maiúsculas', () => {
    expect(buildReply(text('SEGURANÇA'), EMPTY_TRIP)).toContain('Segurança');
  });
  it('saúda mensagens curtas', () => {
    expect(buildReply(text('Oi'), EMPTY_TRIP)).toContain('Eu sou a Aurora');
  });
  it('responde foto e áudio sem fingir que analisou o conteúdo', () => {
    expect(buildReply({ id: '2', author: 'user', at: 0, kind: 'image', uri: 'x', width: 1, height: 1 })).toContain('não analiso');
    expect(buildReply({ id: '3', author: 'user', at: 0, kind: 'audio', uri: 'x', durationMs: 1000 })).toContain('não transcrevo');
  });
  it('tem resposta padrão', () => {
    expect(buildReply(text('xyzzy'), paris)).toContain('Paris');
  });
});

describe('typingDelay', () => {
  it('fica entre 0,8 s e 2 s', () => {
    expect(typingDelay('a')).toBe(800);
    expect(typingDelay('a'.repeat(1000))).toBe(2000);
  });
});
