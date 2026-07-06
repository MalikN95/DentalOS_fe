'use client';

import { useId } from 'react';
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
}: SwitchToggleProps) => {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''} ${className ?? ''}`}
      style={style}
    >
      <input
        id={inputId}
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
};
