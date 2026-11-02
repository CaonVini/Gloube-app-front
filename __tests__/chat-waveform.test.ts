import { WAVE_BARS, barHeight, meterToLevel, pushLevel } from '../src/domain/chat/waveform';

describe('waveform', () => {
  it('meterToLevel converte dBFS em 0..1 e ignora valores inválidos', () => {
    expect(meterToLevel(0)).toBe(1);
    expect(meterToLevel(-50)).toBe(0);
    expect(meterToLevel(-160)).toBe(0);
    expect(meterToLevel(-25)).toBeCloseTo(0.5);
    expect(meterToLevel(undefined)).toBe(0);
    expect(meterToLevel(NaN)).toBe(0);
  });
  it('pushLevel mantém só as últimas barras e limita 0..1', () => {
    let h: number[] = [];
    for (let i = 0; i < WAVE_BARS + 5; i++) h = pushLevel(h, 2);
    expect(h).toHaveLength(WAVE_BARS);
    expect(Math.max(...h)).toBe(1);
  });
  it('barHeight respeita mínimo e máximo', () => {
    expect(barHeight(0)).toBe(4);
    expect(barHeight(1)).toBe(26);
    expect(barHeight(5)).toBe(26);
  });
});
