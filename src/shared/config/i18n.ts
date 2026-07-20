/**
 * Centralized locale / currency configuration.
 *
 * Single source of truth for every locale- or currency-dependent format call.
 * Locale is detected from the JS runtime (Hermes ships full Intl); currency
 * stays a configurable constant so the app behavior is deterministic until a
 * user-facing currency setting is introduced.
 */

const FALLBACK_LOCALE = 'en-US';

function detectLocale(): string {
  try {
    const resolved = new Intl.NumberFormat().resolvedOptions().locale;
    return resolved || FALLBACK_LOCALE;
  } catch {
    return FALLBACK_LOCALE;
  }
}

/** Active BCP-47 locale tag used for every formatter in the app. */
export const LOCALE = detectLocale();

/** ISO-4217 currency code used by `Intl.NumberFormat`. Override here to change app-wide. */
export const CURRENCY = 'UAH';

/** Compact symbol used by row-level UI that renders amount + symbol separately. */
export const CURRENCY_SYMBOL = '₴';
