'use client';

import styles from './TimeSelect.module.css';

type TimeSelectProps = {
  /** 24-hour "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** Flags both selects red, e.g. when this slot overlaps another one. */
  conflict?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const pad = (value: number): string => String(value).padStart(2, '0');

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const STANDARD_MINUTES = [0, 15, 30, 45];

const parseValue = (value: string): { hour: number; minute: number } => {
  const [hour, minute] = value.split(':').map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 9,
    minute: Number.isFinite(minute) ? minute : 0,
  };
};

/** Plain <select>-based 24h time picker — sidesteps the native `<input type="time">`,
 *  whose AM/PM-vs-24h rendering depends on the browser/OS locale rather than anything
 *  this app controls. */
export const TimeSelect = ({
  value,
  onChange,
  disabled = false,
  conflict = false,
  className,
  style,
}: TimeSelectProps) => {
  const { hour, minute } = parseValue(value);
  // Pre-existing data might not land on a 15-minute mark; keep it selectable rather
  // than silently snapping it to the nearest standard option.
  const minuteOptions = [...new Set([...STANDARD_MINUTES, minute])].sort((a, b) => a - b);
  const selectClassName = `${styles.select} ${conflict ? styles.selectConflict : ''}`;

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <select
        className={selectClassName}
        value={hour}
        disabled={disabled}
        aria-label="HH"
        onChange={(event) => onChange(`${pad(Number(event.target.value))}:${pad(minute)}`)}
      >
        {HOURS.map((option) => (
          <option key={option} value={option}>
            {pad(option)}
          </option>
        ))}
      </select>
      <span className={styles.colon}>:</span>
      <select
        className={selectClassName}
        value={minute}
        disabled={disabled}
        aria-label="mm"
        onChange={(event) => onChange(`${pad(hour)}:${pad(Number(event.target.value))}`)}
      >
        {minuteOptions.map((option) => (
          <option key={option} value={option}>
            {pad(option)}
          </option>
        ))}
      </select>
    </div>
  );
};
