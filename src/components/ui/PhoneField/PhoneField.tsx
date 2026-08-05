'use client';

import { useId, useState } from 'react';
import textFieldStyles from '@/components/ui/TextField/TextField.module.css';

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

const COUNTRY_CODE = '996';
const NATIONAL_NUMBER_LENGTH = 9;

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

/** Strips a leading "996" country code and/or local "0" trunk prefix, so both
 *  "+996700123456" and "0700123456" resolve to the same 9-digit national number. */
const extractNationalDigits = (raw: string): string => {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith(COUNTRY_CODE)) digits = digits.slice(COUNTRY_CODE.length);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits.slice(0, NATIONAL_NUMBER_LENGTH);
};

// Grouped with spaces for the input's visible text only.
const formatDisplay = (digits: string): string => {
  const groups = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean);
  return groups.length ? `+${COUNTRY_CODE} ${groups.join(' ')}` : `+${COUNTRY_CODE}`;
};

// Space-free — this is what actually gets committed via onChange, so it
// stays compatible with plain E.164-style validation (e.g. patient OTP login).
const formatCommitted = (digits: string): string => `+${COUNTRY_CODE}${digits}`;

// A record saved under a different country code (e.g. legacy "+7..." data)
// must not get silently mangled into a bogus KG number just because this
// field was re-rendered — leave those as plain free text instead of masking.
const isForeignNumber = (raw: string): boolean =>
  /^\+\d/.test(raw.trim()) && !raw.trim().startsWith(`+${COUNTRY_CODE}`);

/** Phone input defaulting to the +996 (Kyrgyzstan) country code — the prefix
 *  is always shown and can't be typed over; only the 9-digit national number
 *  is actually editable, keystroke by keystroke like TimeSelect's HH:mm mask. */
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
  const [isPlainMode] = useState(() => isForeignNumber(value));
  const [prevValue, setPrevValue] = useState(value);
  const [digits, setDigits] = useState(() => extractNationalDigits(value));

  // Re-derive from a prop change during render (React's documented
  // alternative to syncing props->state via an effect).
  if (!isPlainMode && value !== prevValue) {
    setPrevValue(value);
    setDigits(extractNationalDigits(value));
  }

  const commit = (nextDigits: string) => {
    setDigits(nextDigits);
    onChange(formatCommitted(nextDigits));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      if (digits.length > 0) commit(digits.slice(0, -1));
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) || event.metaKey || event.ctrlKey) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (digits.length >= NATIONAL_NUMBER_LENGTH) return;
    commit(digits + event.key);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    commit(extractNationalDigits(event.clipboardData.getData('text')));
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
        )}
      </div>
      {error ? <span className={textFieldStyles.errorText}>{error}</span> : null}
    </div>
  );
};
