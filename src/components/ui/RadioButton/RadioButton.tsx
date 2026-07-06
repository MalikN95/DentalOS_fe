'use client';

import { useId } from 'react';
import styles from './RadioButton.module.css';

type RadioButtonProps = {
  checked: boolean;
  label?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string) => void;
};

export const RadioButton = ({
  checked,
  label,
  name,
  value,
  disabled = false,
  className,
  style,
  onChange,
}: RadioButtonProps) => {
  const inputId = useId();

  return (
    <label
      htmlFor={inputId}
      className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''} ${className ?? ''}`}
      style={style}
    >
      <input
        id={inputId}
        type="radio"
        className={styles.input}
        checked={checked}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <span className={styles.circle} />
      {label ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
};
