import { CURRENCY, LOCALE } from '@/shared/config/i18n';

const formatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number) {
  return formatter.format(amount);
}