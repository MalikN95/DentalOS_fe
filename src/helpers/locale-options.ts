export type SelectOption = { value: string; label: string };

// Intl.supportedValuesOf is available in modern engines; fall back gracefully.
const intlSupportedValuesOf = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
  .supportedValuesOf;

const safeDisplayName = (names: Intl.DisplayNames, code: string): string => {
  try {
    return names.of(code) ?? code;
  } catch {
    return code;
  }
};

const FALLBACK_TIMEZONES = [
  'UTC',
  'Europe/Moscow',
  'Europe/London',
  'Asia/Bishkek',
  'Asia/Almaty',
  'Asia/Tashkent',
];

const FALLBACK_CURRENCIES = ['USD', 'EUR', 'RUB', 'KGS', 'KZT', 'UZS'];

// Supported UI/clinic languages; labels are derived from locale (Intl.DisplayNames).
const LANGUAGE_CODES = ['ru', 'en', 'ky'];

export const TIMEZONE_OPTIONS: SelectOption[] = (
  intlSupportedValuesOf?.('timeZone') ?? FALLBACK_TIMEZONES
).map((tz) => ({ value: tz, label: tz }));

const currencyNames = new Intl.DisplayNames(['ru'], { type: 'currency' });

export const CURRENCY_OPTIONS: SelectOption[] = (
  intlSupportedValuesOf?.('currency') ?? FALLBACK_CURRENCIES
).map((code) => ({ value: code, label: `${code} — ${safeDisplayName(currencyNames, code)}` }));

const languageNames = new Intl.DisplayNames(['ru'], { type: 'language' });

export const LANGUAGE_OPTIONS: SelectOption[] = LANGUAGE_CODES.map((code) => ({
  value: code,
  label: `${safeDisplayName(languageNames, code)} (${code})`,
}));
