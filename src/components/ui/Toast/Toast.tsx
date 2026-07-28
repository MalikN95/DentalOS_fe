'use client';

import { CheckIcon, CloseIcon, InfoIcon } from '@/components/icons/icons';
import styles from './Toast.module.css';

export type ToastColor = 'success' | 'danger' | 'primary';

type ToastProps = {
  message: string;
  color?: ToastColor;
  isClosing?: boolean;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

const ICONS: Record<ToastColor, React.ReactNode> = {
  success: <CheckIcon size={18} />,
  danger: <CloseIcon size={18} />,
  primary: <InfoIcon size={18} />,
};

export const Toast = ({
  message,
  color = 'success',
  isClosing = false,
  onClose,
  className,
  style,
}: ToastProps) => (
  <div
    role="status"
    className={`${styles.toast} ${styles[color]} ${isClosing ? styles.closing : ''} ${className ?? ''}`}
    style={style}
  >
    <span className={styles.icon}>{ICONS[color]}</span>
    <span className={styles.message}>{message}</span>
    {onClose ? (
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <CloseIcon size={14} />
      </button>
    ) : null}
  </div>
);
