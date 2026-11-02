import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Regressão "ícones sumiram": todo require() de icons.tsx deve apontar para um PNG existente e válido.
const src = readFileSync(join(__dirname, '../src/presentation/discover/icons.tsx'), 'utf8');
const paths = [...src.matchAll(/require\('([^']+\.png)'\)/g)].map((m) => m[1]!);

describe('ícones do fluxo Descubra', () => {
  it('declara ícones', () => expect(paths.length).toBeGreaterThan(5));
  it.each(paths)('%s existe e é PNG válido', (rel) => {
    const file = join(__dirname, '../src/presentation/discover', rel);
    expect(existsSync(file)).toBe(true);
    expect(readFileSync(file).subarray(1, 4).toString()).toBe('PNG');
  });
});
