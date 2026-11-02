import { listHeight } from '../src/presentation/trip/DestinationList';

// Regressão do "espaço gigante em branco": a lista ocupa só o que as linhas precisam.
describe('listHeight', () => {
  it('é 0 sem destinos e cresce só com linhas e espaços', () => {
    expect(listHeight(0, 48)).toBe(0);
    expect(listHeight(1, 48)).toBe(48);
    expect(listHeight(2, 48)).toBe(106);
    expect(listHeight(3, 48)).toBe(164);
  });
});
