import { readFileSync } from 'fs';
import { join } from 'path';

/** Regressão: hooks em RootStack depois de um `return` antecipado quebram com "useContext ... not supported" no web. */
describe('app/_layout.tsx', () => {
  it('chama todos os hooks de RootStack antes do primeiro return', () => {
    const src = readFileSync(join(__dirname, '..', 'app', '_layout.tsx'), 'utf8');
    const body = src.slice(src.indexOf('function RootStack'), src.indexOf('export default function RootLayout'));
    const firstReturn = body.indexOf('return');
    for (const hook of ['useAuth()', 'useDemoSession()']) {
      const at = body.indexOf(hook);
      expect(at).toBeGreaterThan(-1);
      expect(at).toBeLessThan(firstReturn);
    }
  });
});
