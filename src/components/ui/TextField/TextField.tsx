'use client';

import { forwardRef, useId } from 'react';
import styles from './TextField.module.css';

type TextFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'style'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { label, hint, error, iconLeft, iconRight, className, style, id, disabled, ...inputProps },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const handleAnimationStart = (event: React.AnimationEvent<HTMLInputElement>) => {
      if (event.animationName === styles.onAutoFillStart) {
        inputProps.onChange?.(event as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    };

    const fieldClassName = [
      styles.field,
      error ? styles.fieldError : '',
      disabled ? styles.fieldDisabled : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
        {label ? (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <div className={fieldClassName}>
          {iconLeft ? <span className={styles.icon}>{iconLeft}</span> : null}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            disabled={disabled}
            onAnimationStart={handleAnimationStart}
            {...inputProps}
          />
          {iconRight ? <span className={styles.icon}>{iconRight}</span> : null}
        </div>
        {error ? <span className={styles.errorText}>{error}</span> : null}
        {!error && hint ? <span className={styles.hint}>{hint}</span> : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
