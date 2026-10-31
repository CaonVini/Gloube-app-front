import { validateLogin, validateRegister } from '../src/domain/auth-forms';

describe('validateLogin', () => {
  it('exige e-mail válido e senha', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({ email: 'Informe o e-mail', password: 'Informe a senha' });
    expect(validateLogin({ email: 'a@b', password: 'x' }).email).toBe('E-mail inválido');
    expect(validateLogin({ email: 'a@b.com', password: 'x' })).toEqual({});
  });
});

describe('validateRegister', () => {
  const ok = { name: 'Ana', email: 'ana@gloube.com', password: '12345678', acceptedTerms: true };
  it('aceita dados válidos', () => expect(validateRegister(ok)).toEqual({}));
  it('exige senha de 8+ caracteres', () => expect(validateRegister({ ...ok, password: '1234567' }).password).toBeDefined());
  it('exige aceite dos termos', () => expect(validateRegister({ ...ok, acceptedTerms: false }).acceptedTerms).toBeDefined());
  it('rejeita nome curto', () => expect(validateRegister({ ...ok, name: ' a ' }).name).toBeDefined());
});
