'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { replayAutofill } from '@/helpers/autofill';
import { useScrollShadow } from '@/hooks/useScrollShadow';
import styles from './Modal.module.css';

export type ModalSize = 'sm' | 'md' | 'lg';

type ModalProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeLabel?: string;
  scrollHintLabel?: string;
  /** Blocks overlay click, Escape and the close button (e.g. while saving). */
  isLocked?: boolean;
  /** Set false to require the close/cancel button — overlay click and Escape won't close it. */
  closeOnBackdrop?: boolean;
  /** Set false when the caller renders its own close control in the title (avoids two close buttons). */
  showCloseButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose?: () => void;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
};

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m6 9 6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Modal = ({
  title,
  children,
  footer,
  size = 'md',
  closeLabel = 'Close',
  scrollHintLabel = 'Scroll for more',
  isLocked = false,
  closeOnBackdrop = true,
  showCloseButton = true,
  className,
  style,
  onSubmit,
  onClose,
}: ModalProps) => {
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { scrollRef, contentRef, canScrollUp, canScrollDown, scrollDown } = useScrollShadow();

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      // browser autofill can bypass React events — flush it into form state first
      replayAutofill(formRef.current);
      onSubmit?.(event);
    },
    [onSubmit],
  );

  const handleClose = useCallback(() => {
    if (!isLocked) {
      onClose?.();
    }
  }, [isLocked, onClose]);

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdrop, handleClose],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnBackdrop && event.key === 'Escape') {
        handleClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnBackdrop, handleClose]);

  const inner = (
    <>
      <div className={styles.scrollArea}>
        <div ref={scrollRef} className={styles.body}>
          <div ref={contentRef} className={styles.content}>
            {children}
          </div>
        </div>

        <span
          className={`${styles.shadow} ${styles.shadowTop} ${canScrollUp ? styles.shadowVisible : ''}`}
          aria-hidden="true"
        />
        <span
          className={`${styles.shadow} ${styles.shadowBottom} ${canScrollDown ? styles.shadowVisible : ''}`}
          aria-hidden="true"
        />

        {canScrollDown ? (
          <button
            type="button"
            className={styles.scrollHint}
            aria-label={scrollHintLabel}
            title={scrollHintLabel}
            onClick={scrollDown}
          >
            <ChevronDownIcon />
          </button>
        ) : null}
      </div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </>
  );

  return (
    <div className={styles.overlay} role="presentation" onClick={handleOverlayClick}>
      <div
        className={`${styles.dialog} ${sizeClasses[size]} ${className ?? ''}`}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className={styles.header}>
          <span id={titleId} className={styles.title}>
            {title}
          </span>
          {onClose && showCloseButton ? (
            <button
              type="button"
              className={styles.closeButton}
              aria-label={closeLabel}
              disabled={isLocked}
              onClick={handleClose}
            >
              ×
            </button>
          ) : null}
        </div>

        {onSubmit ? (
          <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
            {inner}
          </form>
        ) : (
          <div className={styles.form}>{inner}</div>
        )}
      </div>
    </div>
  );
};
