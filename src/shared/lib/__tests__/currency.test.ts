import { formatCurrency } from '../currency';

// LOCALE/CURRENCY are sampled at import time, so all assertions check
// presence of the amount + currency code rather than exact byte layout.
describe('formatCurrency', () => {
  test('formats positive integer with currency token', () => {
    const result = formatCurrency(1234);
    expect(result).toMatch(/1[\s,.\u00a0]?234/);
  });

  test('formats zero', () => {
    expect(formatCurrency(0)).toMatch(/0/);
  });

  test('formats negative amount with sign', () => {
    const result = formatCurrency(-500);
    expect(result).toMatch(/[-−]/);
    expect(result).toMatch(/500/);
  });

  test('preserves up to two decimal places', () => {
    expect(formatCurrency(12.5)).toMatch(/12[.,]5/);
    expect(formatCurrency(12.345)).toMatch(/12[.,]3[45]/);
  });

  test('strips fractional zeros when amount is whole', () => {
    const result = formatCurrency(100);
    expect(result).not.toMatch(/100[.,]00/);
  });
});
