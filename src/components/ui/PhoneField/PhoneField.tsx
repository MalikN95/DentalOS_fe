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

type KnownCountry = {
  /** Dial code digits, no "+". */
  code: string;
  nationalLength: number;
};

// Just used to auto-mask/auto-detect nicely for the countries clinics in this
// rollout hit most — the code field itself accepts any dial code, not only
// these. Extend freely.
const KNOWN_COUNTRIES: KnownCountry[] = [
  { code: '996', nationalLength: 9 }, // Kyrgyzstan
  { code: '998', nationalLength: 9 }, // Uzbekistan
  { code: '992', nationalLength: 9 }, // Tajikistan
  { code: '993', nationalLength: 8 }, // Turkmenistan
  { code: '7', nationalLength: 10 }, // Kazakhstan/Russia
];

const DEFAULT_CODE = KNOWN_COUNTRIES[0].code;
const MAX_CODE_LENGTH = 4;
// E.164 allows up to 15 digits total; used as the national-number cap for
// any dial code we don't have an exact length for.
const FALLBACK_NATIONAL_LENGTH = 12;

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
const CODES_BY_LENGTH_DESC = [...KNOWN_COUNTRIES].sort((a, b) => b.code.length - a.code.length);

const nationalLengthForCode = (code: string): number =>
  KNOWN_COUNTRIES.find((country) => country.code === code)?.nationalLength ??
  FALLBACK_NATIONAL_LENGTH;

/** Only used to make a good first guess for an existing value/paste — the
 *  user is always free to overwrite the detected code afterwards. */
const detectCode = (digitsOnly: string): string | null =>
  CODES_BY_LENGTH_DESC.find((country) => digitsOnly.startsWith(country.code))?.code ?? null;

/** Strips the given dial code and/or a local "0" trunk prefix, so both
 *  "+996700123456" and "0700123456" resolve to the same national number. */
const extractNationalDigits = (raw: string, code: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith(code)) digits = digits.slice(code.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, nationalLengthForCode(code));
};

// Grouped with spaces for the input's visible text only.
const formatDisplay = (digits: string): string => {
  const groups: string[] = [];
  for (let i = 0; i < digits.length; i += 3) groups.push(digits.slice(i, i + 3));
  return groups.join(' ');
};

// Space-free — this is what actually gets committed via onChange, so it
// stays compatible with plain E.164-style validation (e.g. patient OTP login).
const formatCommitted = (code: string, digits: string): string => `+${code}${digits}`;

// A record saved without a "+" at all (e.g. legacy free-text data) must not
// get silently mangled into a bogus number just because this field
// re-rendered — leave those as plain free text instead of masking.
const isPlainTextNumber = (raw: string): boolean => !/^\+\d/.test(raw.trim());

/** Phone input with an editable dial-code field (defaults to +996, but any
 *  code can be typed — it's not limited to a fixed list); only digits are
 *  actually editable, keystroke by keystroke like TimeSelect's HH:mm mask.
 *  Changing the code re-masks the same digits to its national length
 *  instead of discarding them. */
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
  const [isPlainMode] = useState(() => isPlainTextNumber(value));
  const [prevValue, setPrevValue] = useState(value);
  const [code, setCode] = useState<string>(
    () => detectCode(value.replace(/\D/g, '')) ?? DEFAULT_CODE,
  );
  const [digits, setDigits] = useState(() => extractNationalDigits(value, code));

  // Re-derive from a prop change during render (React's documented
  // alternative to syncing props->state via an effect).
  if (!isPlainMode && value !== prevValue) {
    setPrevValue(value);
    const nextCode = detectCode(value.replace(/\D/g, '')) ?? code;
    setCode(nextCode);
    setDigits(extractNationalDigits(value, nextCode));
  }

  const commit = (nextCode: string, nextDigits: string) => {
    setCode(nextCode);
    setDigits(nextDigits);
    onChange(formatCommitted(nextCode, nextDigits));
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextCode = event.target.value.replace(/\D/g, '').slice(0, MAX_CODE_LENGTH) || DEFAULT_CODE;
    commit(nextCode, digits.slice(0, nationalLengthForCode(nextCode)));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      if (digits.length > 0) commit(code, digits.slice(0, -1));
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) || event.metaKey || event.ctrlKey) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (digits.length >= nationalLengthForCode(code)) return;
    commit(code, digits + event.key);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text');
    const nextCode = detectCode(pasted.replace(/\D/g, '')) ?? code;
    commit(nextCode, extractNationalDigits(pasted, nextCode));
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
            <span className={styles.codePrefix}>+</span>
            <input
              className={styles.codeInput}
              type="text"
              inputMode="numeric"
              aria-label="Country code"
              disabled={disabled}
              value={code}
              onChange={handleCodeChange}
              size={Math.max(code.length, 3)}
            />
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
