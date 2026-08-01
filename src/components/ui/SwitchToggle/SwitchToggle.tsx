'use client';

import styles from './SwitchToggle.module.css';

type SwitchToggleProps = {
  checked: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (checked: boolean) => void;
};

export const SwitchToggle = ({
  checked,
  label,
  disabled = false,
  className,
  style,
  onChange,
}: SwitchToggleProps) => (
  // The input is nested inside the label, so the browser already associates
  // them natively. Adding htmlFor/id on top of that (which this project's
  // lint preset otherwise wants) redundantly re-targets the same element and
  // double-fires the click — toggles on, then immediately back off — which
  // is why the switch looked like it did nothing. Nesting alone is a fully
  // valid, accessible association; only this one rule insists on both.
  // eslint-disable-next-line jsx-a11y/label-has-associated-control -- see above, nesting alone is intentional here
  <label
    className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''} ${className ?? ''}`}
    style={style}
  >
    <input
      type="checkbox"
      role="switch"
      className={styles.input}
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.checked)}
    />
    <span className={styles.track} />
    {label ? <span className={styles.label}>{label}</span> : null}
  </label>
);
