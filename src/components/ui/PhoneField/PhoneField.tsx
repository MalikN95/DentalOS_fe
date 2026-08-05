'use client';

import { useId, useState } from 'react';
import textFieldStyles from '@/components/ui/TextField/TextField.module.css';
import styles from './PhoneField.module.css';

type PhoneFieldProps = {
  label?: string;
  error?: string;
  /** Clean E.164-ish string with no spaces, e.g. "+996700123456". */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type CountryCode = {
  /** Dial code digits, no "+". */
  code: string;
  label: string;
  nationalLength: number;
};

// Ordered by how often clinics in this rollout hit them; extend freely — the
// selector/masking logic below reads entirely off this list.
const COUNTRY_CODES: CountryCode[] = [
  { code: '996', label: '🇰🇬 +996', nationalLength: 9 },
  { code: '998', label: '🇺🇿 +998', nationalLength: 9 },
  { code: '992', label: '🇹🇯 +992', nationalLength: 9 },
  { code: '993', label: '🇹🇲 +993', nationalLength: 8 },
  { code: '7', label: '🇰🇿 +7', nationalLength: 10 },
];

const DEFAULT_COUNTRY = COUNTRY_CODES[0];

const NAVIGATION_KEYS = new Set([
  'Tab',
  'Shift',
  'Control',
  'Meta',
  'Alt',
  'Escape',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

// Longer codes first so e.g. "998" isn't shadowed by a shorter overlapping prefix.
const CODES_BY_LENGTH_DESC = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);

const detectCountry = (digitsOnly: string): CountryCode | null =>
  CODES_BY_LENGTH_DESC.find((country) => digitsOnly.startsWith(country.code)) ?? null;

/** Strips the given country's dial code and/or a local "0" trunk prefix, so
 *  both "+996700123456" and "0700123456" resolve to the same national number. */
const extractNationalDigits = (raw: string, country: CountryCode): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith(country.code)) digits = digits.slice(country.code.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, country.nationalLength);
};

// Grouped with spaces for the input's visible text only.
const formatDisplay = (digits: string): string => {
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) groups.push(digits.slice(i, i + 3));
  return groups.join(' ');
};

// Space-free — this is what actually gets committed via onChange, so it
// stays compatible with plain E.164-style validation (e.g. patient OTP login).
const formatCommitted = (country: CountryCode, digits: string): string =>
  `+${country.code}${digits}`;

// A record saved under a dial code we don't offer in the selector (e.g. legacy
// "+1..." data) must not get silently mangled into a bogus number just because
// this field re-rendered — leave those as plain free text instead of masking.
const isUnsupportedCountryNumber = (raw: string): boolean => {
  const trimmed = raw.trim();
  if (!/^\+\d/.test(trimmed)) return false;
  return detectCountry(trimmed.replace(/\D/g, '')) === null;
};

/** Phone input with a country-code selector (defaults to +996); only the
 *  national number is actually editable, keystroke by keystroke like
 *  TimeSelect's HH:mm mask. Switching the country re-masks the same digits
 *  to the new country's length instead of discarding them. */
export const PhoneField = ({
  label,
  error,
  value,
  onChange,
  onBlur,
  disabled = false,
  className,
  style,
}: PhoneFieldProps) => {
  const inputId = useId();
  const [isPlainMode] = useState(() => isUnsupportedCountryNumber(value));
  const [prevValue, setPrevValue] = useState(value);
  const [country, setCountry] = useState<CountryCode>(
    () => detectCountry(value.replace(/\D/g, '')) ?? DEFAULT_COUNTRY,
  );
  const [digits, setDigits] = useState(() => extractNationalDigits(value, country));

  // Re-derive from a prop change during render (React's documented
  // alternative to syncing props->state via an effect).
  if (!isPlainMode && value !== prevValue) {
    setPrevValue(value);
    const nextCountry = detectCountry(value.replace(/\D/g, '')) ?? country;
    setCountry(nextCountry);
    setDigits(extractNationalDigits(value, nextCountry));
  }

  const commit = (nextCountry: CountryCode, nextDigits: string) => {
    setCountry(nextCountry);
    setDigits(nextDigits);
    onChange(formatCommitted(nextCountry, nextDigits));
  };

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCountry =
      COUNTRY_CODES.find((candidate) => candidate.code === event.target.value) ?? DEFAULT_COUNTRY;
    commit(nextCountry, digits.slice(0, nextCountry.nationalLength));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      if (digits.length > 0) commit(country, digits.slice(0, -1));
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) || event.metaKey || event.ctrlKey) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (digits.length >= country.nationalLength) return;
    commit(country, digits + event.key);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const nextCountry = detectCountry(pasted.replace(/\D/g, '')) ?? country;
    commit(nextCountry, extractNationalDigits(pasted, nextCountry));
  };

  const fieldClassName = [
    textFieldStyles.field,
    error ? textFieldStyles.fieldError : '',
    disabled ? textFieldStyles.fieldDisabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${textFieldStyles.wrapper} ${className ?? ''}`} style={style}>
      {label ? (
        <label className={textFieldStyles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={fieldClassName}>
        {isPlainMode ? (
          <input
            id={inputId}
            className={textFieldStyles.input}
            type="tel"
            autoComplete="tel"
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
          />
        ) : (
          <>
            <select
              className={styles.countrySelect}
              aria-label="Country code"
              disabled={disabled}
              value={country.code}
              onChange={handleCountryChange}
            >
              {COUNTRY_CODES.map((candidate) => (
                <option key={candidate.code} value={candidate.code}>
                  {candidate.label}
                </option>
              ))}
            </select>
            <input
              id={inputId}
              className={textFieldStyles.input}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              disabled={disabled}
              value={formatDisplay(digits)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={onBlur}
              onChange={() => {}}
            />
          </>
        )}
      </div>
      {error ? <span className={textFieldStyles.errorText}>{error}</span> : null}
    </div>
  );
};
