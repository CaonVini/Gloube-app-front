import { MAX_AVATAR_BYTES, MAX_NAME, firstNameOf, sanitizeName, statA11y, validateAvatar, validateName, DEMO_STATS, ACCOUNT_ROWS } from '../src/domain/profile';
import { shouldReplace } from '../src/presentation/navigation/nav-items';

describe('validateAvatar', () => {
  const ok = { uri: 'file:///cache/a.jpg', mimeType: 'image/jpeg', fileSize: 1000 };
  it('aceita JPG, PNG e WebP locais dentro do limite', () => {
    expect(validateAvatar(ok).ok).toBe(true);
    expect(validateAvatar({ ...ok, mimeType: 'image/png' }).ok).toBe(true);
    expect(validateAvatar({ ...ok, mimeType: 'IMAGE/WEBP' }).ok).toBe(true);
  });
  it('aceita quando o sistema não informa tipo/tamanho (web, alguns Android)', () => {
    expect(validateAvatar({ uri: 'blob:http://x/1' }).ok).toBe(true);
  });
  it('recusa formatos que não são foto suportada', () => {
    for (const mimeType of ['image/gif', 'image/svg+xml', 'image/heic', 'application/pdf', 'video/mp4']) {
      expect(validateAvatar({ ...ok, mimeType }).ok).toBe(false);
    }
  });
  it('recusa arquivo acima do limite e aceita exatamente no limite', () => {
    expect(validateAvatar({ ...ok, fileSize: MAX_AVATAR_BYTES + 1 }).ok).toBe(false);
    expect(validateAvatar({ ...ok, fileSize: MAX_AVATAR_BYTES }).ok).toBe(true);
  });
  it('recusa URI ausente ou com esquema inesperado (remoto, javascript:, svg em data:)', () => {
    for (const uri of [undefined, null, '', 'https://evil.test/a.jpg', 'javascript:alert(1)', 'data:image/svg+xml;base64,AAAA', 'http://x/a.png']) {
      expect(validateAvatar({ ...ok, uri }).ok).toBe(false);
    }
  });
});

describe('validateName / sanitizeName', () => {
  it('aceita nomes com acento, hífen, apóstrofo e ponto, e apara espaços', () => {
    expect(validateName('  Vinícius   Costa ')).toEqual({ ok: true, value: 'Vinícius Costa' });
    expect(validateName("Ana-Maria D'Ávila Jr.")).toEqual({ ok: true, value: "Ana-Maria D'Ávila Jr." });
    expect(validateName('李雷').ok).toBe(true);
  });
  it('remove controles e caracteres de direção invisíveis', () => {
    expect(sanitizeName('Ana\u0000‮ Lima​')).toBe('Ana Lima');
  });
  it('recusa vazio, curto, longo, dígitos e símbolos/marcação', () => {
    expect(validateName('').ok).toBe(false);
    expect(validateName(' A ').ok).toBe(false);
    expect(validateName('a'.repeat(MAX_NAME + 1)).ok).toBe(false);
    expect(validateName('João 2').ok).toBe(false);
    expect(validateName('<script>alert(1)</script>').ok).toBe(false);
    expect(validateName('-João').ok).toBe(false);
  });
});

describe('dados fictícios e navegação', () => {
  it('a faixa tem 3 números com rótulo de acessibilidade', () => {
    expect(DEMO_STATS.map((s) => s.value)).toEqual([4, 3, 28]);
    expect(statA11y(DEMO_STATS[0]!)).toBe('4 viagens realizadas');
  });
  it('lista os atalhos da conta na ordem do mockup', () => {
    expect(ACCOUNT_ROWS.map((r) => r.label)).toEqual(['Dados pessoais', 'Preferências de viagem', 'Notificações', 'Ajuda e suporte']);
  });
  it('firstNameOf pega a primeira palavra', () => {
    expect(firstNameOf('  Vinicius Costa ')).toBe('Vinicius');
    expect(firstNameOf('')).toBe('');
  });
  it('sair do perfil troca a tela (não empilha); das demais abas empilha', () => {
    expect(shouldReplace('profile')).toBe(true);
    expect(shouldReplace('aurora')).toBe(true);
    expect(shouldReplace('discover')).toBe(false);
  });
});
