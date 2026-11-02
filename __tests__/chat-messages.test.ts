import {
  MAX_IMAGE_BYTES, MAX_MESSAGES, MAX_TEXT_LENGTH, canSend, capMessages, fitImage, formatDuration, formatTime, nextMessageId, sanitizeText, validateAudio, validateImage,
} from '../src/domain/chat/messages';

describe('sanitizeText', () => {
  it('remove controles e caracteres de direção invisíveis', () => {
    expect(sanitizeText('oi\u0000\u0007 ‮abc​')).toBe('oi abc');
  });
  it('normaliza quebras, limita linhas em branco e apara', () => {
    expect(sanitizeText('  a\r\n\r\n\r\n\r\nb  \n')).toBe('a\n\nb');
  });
  it('mantém marcação como texto puro (sem interpretar)', () => {
    expect(sanitizeText('<script>alert(1)</script> **x**')).toBe('<script>alert(1)</script> **x**');
  });
  it('corta no tamanho máximo', () => {
    expect(sanitizeText('a'.repeat(MAX_TEXT_LENGTH + 50))).toHaveLength(MAX_TEXT_LENGTH);
  });
});

describe('canSend', () => {
  it('rejeita vazio e só espaços/controles', () => {
    expect(canSend('')).toBe(false);
    expect(canSend(' \n\t​ ')).toBe(false);
    expect(canSend(' oi ')).toBe(true);
  });
});

describe('validateImage', () => {
  it('aceita tipos de foto conhecidos', () => {
    expect(validateImage({ uri: 'file://a.jpg', mimeType: 'image/jpeg', fileSize: 1000 }).ok).toBe(true);
    expect(validateImage({ uri: 'file://a', mimeType: undefined }).ok).toBe(true);
  });
  it('rejeita tipo inválido, arquivo grande e sem uri', () => {
    expect(validateImage({ uri: 'x', mimeType: 'image/svg+xml' }).ok).toBe(false);
    expect(validateImage({ uri: 'x', mimeType: 'application/pdf' }).ok).toBe(false);
    expect(validateImage({ uri: 'x', mimeType: 'image/png', fileSize: MAX_IMAGE_BYTES + 1 }).ok).toBe(false);
    expect(validateImage({ uri: null }).ok).toBe(false);
  });
});

describe('validateAudio', () => {
  it('rejeita áudio sem arquivo ou curto demais', () => {
    expect(validateAudio(5000, null).ok).toBe(false);
    expect(validateAudio(100, 'file://a.m4a').ok).toBe(false);
    expect(validateAudio(3000, 'file://a.m4a').ok).toBe(true);
  });
});

describe('fitImage', () => {
  it('respeita a proporção e a caixa máxima, sem ampliar', () => {
    expect(fitImage(1000, 500, 200, 300)).toEqual({ width: 200, height: 100 });
    expect(fitImage(500, 1000, 200, 300)).toEqual({ width: 150, height: 300 });
    expect(fitImage(100, 50, 200, 300)).toEqual({ width: 100, height: 50 });
  });
  it('usa fallback com dimensões inválidas', () => {
    expect(fitImage(0, 0, 200, 300)).toEqual({ width: 200, height: 150 });
  });
});

describe('formatos', () => {
  it('formatDuration', () => {
    expect(formatDuration(7000)).toBe('0:07');
    expect(formatDuration(65000)).toBe('1:05');
    expect(formatDuration(NaN)).toBe('0:00');
    expect(formatDuration(-5)).toBe('0:00');
  });
  it('formatTime usa 24h com zero à esquerda', () => {
    expect(formatTime(new Date(2026, 0, 1, 9, 5).getTime())).toBe('09:05');
  });
});

describe('capMessages / nextMessageId', () => {
  it('mantém só as últimas mensagens', () => {
    const list = Array.from({ length: MAX_MESSAGES + 5 }, (_, i) => i);
    const out = capMessages(list);
    expect(out).toHaveLength(MAX_MESSAGES);
    expect(out[0]).toBe(5);
  });
  it('gera ids únicos', () => {
    expect(new Set(Array.from({ length: 50 }, nextMessageId)).size).toBe(50);
  });
});
