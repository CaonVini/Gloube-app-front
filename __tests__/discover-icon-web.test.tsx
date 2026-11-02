import { Image, Platform } from 'react-native';
import { DIcon, assetUri } from '../src/presentation/discover/icons';

// Regressão: no react-native-web não existe Image.resolveAssetSource (crash "is not a function").
describe('DIcon na web', () => {
  const original = Platform.OS;
  const resolve = (Image as unknown as { resolveAssetSource?: unknown }).resolveAssetSource;
  beforeEach(() => { (Platform as { OS: string }).OS = 'web'; delete (Image as unknown as Record<string, unknown>).resolveAssetSource; });
  afterEach(() => { (Platform as { OS: string }).OS = original; (Image as unknown as Record<string, unknown>).resolveAssetSource = resolve; });

  it('renderiza sem lançar mesmo sem resolveAssetSource', () => {
    let el: unknown;
    expect(() => { el = DIcon({ name: 'pin', size: 20, color: '#1F3D36' }); }).not.toThrow();
    expect(el).not.toBeNull();
  });
  it('assetUri aceita string, {uri}, {default} e valores sem uri', () => {
    expect(assetUri('/a.png')).toBe('/a.png');
    expect(assetUri({ uri: '/b.png' })).toBe('/b.png');
    expect(assetUri({ default: '/c.png' })).toBe('/c.png');
    expect(assetUri(7)).toBeUndefined();
  });
});
