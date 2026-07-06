import styles from './EmptyState.module.css';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className,
  style,
}: EmptyStateProps) => (
  <div className={`${styles.card} ${className ?? ''}`} style={style}>
    {icon ? <span className={styles.icon}>{icon}</span> : null}
    <span className={styles.title}>{title}</span>
    {description ? <span className={styles.description}>{description}</span> : null}
    {action ?? null}
  </div>
);
