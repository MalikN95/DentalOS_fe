'use client';

import { useRef, useState } from 'react';
import styles from './TimeSelect.module.css';

type TimeSelectProps = {
  /** 24-hour "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Flags the input red, e.g. when this slot overlaps another one. */
  conflict?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const NAVIGATION_KEYS = new Set([
  'Tab',
  'Shift',
  'Control',
  'Meta',
  'Alt',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

const MINUTES_PER_DAY = 24 * 60;

const pad = (value: number): string => String(value).padStart(2, '0');

const parseValue = (value: string): { hour: number; minute: number } => {
  const [hour, minute] = value.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) && hour >= 0 && hour <= 23 ? hour : 9,
    minute: Number.isFinite(minute) && minute >= 0 && minute <= 59 ? minute : 0,
  };
};

const digitsOf = (value: string): string => {
  const { hour, minute } = parseValue(value);
  return `${pad(hour)}${pad(minute)}`;
};

const formatDigits = (digits: string): string =>
  digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;

/** Position-aware mask so an out-of-range time can never actually be typed. */
const isDigitAllowed = (digitsSoFar: string, digit: string): boolean => {
  const position = digitsSoFar.length;
  if (position === 0) return digit <= '2';
  if (position === 1) return digitsSoFar[0] === '2' ? digit <= '3' : true;
  if (position === 2) return digit <= '5';
  return position === 3;
};

const wrapMinutes = (totalMinutes: number): number =>
  ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

/** Masked 24h "HH:mm" text input — type "0600" and it becomes "06:00" as you go,
 *  invalid digits (e.g. a "9" for the hour's tens place) are rejected on entry so
 *  the value is always a valid time, and Up/Down nudge by 30 minutes
 *  (Shift+Up/Down by an hour) for quick adjustment without typing at all. */
export const TimeSelect = ({
  value,
  onChange,
  disabled = false,
  conflict = false,
  className,
  style,
}: TimeSelectProps) => {
  const { hour, minute } = parseValue(value);
  const [prevValue, setPrevValue] = useState(value);
  const [digits, setDigits] = useState(() => digitsOf(value));
  const [freshStart, setFreshStart] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-derive from a prop change during render (React's documented
  // alternative to syncing props->state via an effect).
  if (value !== prevValue) {
    setPrevValue(value);
    setDigits(digitsOf(value));
    setFreshStart(true);
  }

  const commit = (fourDigits: string) => {
    onChange(`${fourDigits.slice(0, 2)}:${fourDigits.slice(2, 4)}`);
  };

  const nudge = (deltaMinutes: number) => {
    const total = wrapMinutes(hour * 60 + minute + deltaMinutes);
    onChange(`${pad(Math.floor(total / 60))}:${pad(total % 60)}`);
  };

  const handleFocus = () => {
    setFreshStart(true);
    inputRef.current?.select();
  };

  const handleBlur = () => {
    setDigits(digitsOf(value));
    setFreshStart(true);
  };

  const appendDigit = (digit: string) => {
    const base = freshStart ? '' : digits;
    if (base.length >= 4 || !isDigitAllowed(base, digit)) return;

    const next = base + digit;
    setDigits(next);
    setFreshStart(false);
    if (next.length === 4) commit(next);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const step = event.shiftKey ? 60 : 30;
      nudge(event.key === 'ArrowUp' ? step : -step);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      setDigits(freshStart ? '' : digits.slice(0, -1));
      setFreshStart(false);
      return;
    }

    if (event.key === 'Escape') {
      setDigits(digitsOf(value));
      setFreshStart(true);
      inputRef.current?.blur();
      return;
    }

    if (event.key === 'Enter') {
      inputRef.current?.blur();
      return;
    }

    if (NAVIGATION_KEYS.has(event.key) || event.metaKey || event.ctrlKey) return;

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    appendDigit(event.key);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '');
    const next = pasted
      .split('')
      .reduce(
        (acc, digit) => (acc.length < 4 && isDigitAllowed(acc, digit) ? acc + digit : acc),
        freshStart ? '' : digits,
      );
    setDigits(next);
    setFreshStart(false);
    if (next.length === 4) commit(next);
  };

  const displayValue = formatDigits(freshStart ? digitsOf(value) : digits);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      className={`${styles.input} ${conflict ? styles.inputConflict : ''} ${className ?? ''}`}
      style={style}
      value={displayValue}
      disabled={disabled}
      aria-label="HH:mm"
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onChange={() => {}}
    />
  );
};
