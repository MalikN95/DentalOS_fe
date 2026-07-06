'use client';

import { useEffect, useId, useRef } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = {
  checked: boolean;
  label?: string;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (checked: boolean) => void;
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M2.5 6.5L4.75 8.75L9.5 3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MinusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Checkbox = ({
  checked,
  label,
  indeterminate = false,
  disabled = false,
  className,
  style,
  onChange,
}: CheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const renderIcon = () => {
    if (indeterminate) return <MinusIcon />;
    if (checked) return <CheckIcon />;
    return null;
  };

  return (
    <label
      htmlFor={inputId}
      className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ''} ${className ?? ''}`}
      style={style}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className={styles.box}>{renderIcon()}</span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
};
