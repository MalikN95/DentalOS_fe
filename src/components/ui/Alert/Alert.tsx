import styles from './Alert.module.css';

export type AlertColor = 'primary' | 'gray' | 'danger' | 'success';

type AlertProps = {
  children: React.ReactNode;
  title?: string;
  color?: AlertColor;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
};

export const Alert = ({
  children,
  title,
  color = 'primary',
  icon,
  className,
  style,
  onClose,
}: AlertProps) => (
  <div role="alert" className={`${styles.alert} ${styles[color]} ${className ?? ''}`} style={style}>
    {icon ?? null}
    <div className={styles.content}>
      {title ? <span className={styles.title}>{title}</span> : null}
      <span>{children}</span>
    </div>
    {onClose ? (
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    ) : null}
  </div>
);
