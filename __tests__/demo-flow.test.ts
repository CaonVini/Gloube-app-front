import { DEMO_USER, getInitials } from '../src/domain/demo-user';
import { createDemoAuthActions } from '../src/presentation/auth-ui/authActions';

describe('getInitials', () => {
  it('usa primeira e última inicial em maiúsculas', () => {
    expect(getInitials('Vinicius Costa')).toBe('VC');
    expect(getInitials('  ana maria  souza ')).toBe('AS');
  });
  it('lida com nome único e vazio', () => {
    expect(getInitials('Vinicius')).toBe('V');
    expect(getInitials('   ')).toBe('');
  });
  it('usuário fictício gera VC', () => {
    expect(getInitials(DEMO_USER.fullName)).toBe('VC');
  });
});

describe('createDemoAuthActions', () => {
  it('login, cadastro e social abrem a sessão fictícia', async () => {
    const signIn = jest.fn();
    const a = createDemoAuthActions(signIn);
    await a.login({ email: 'a@b.com', password: 'x' });
    await a.register({} as never);
    await a.loginWithGoogle();
    await a.loginWithFacebook();
    expect(signIn).toHaveBeenCalledTimes(4);
  });
});
