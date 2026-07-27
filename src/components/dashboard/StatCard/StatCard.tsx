import styles from './StatCard.module.css';

export type StatCardAccent = 'primary' | 'success' | 'danger';

type StatCardProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: StatCardAccent;
  change?: number;
  changeLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const StatCard = ({
  label,
  value,
  icon,
  accent = 'primary',
  change,
  changeLabel,
  className,
  style,
}: StatCardProps) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.row}>
        {icon ? <span className={`${styles.iconBadge} ${styles[accent]}`}>{icon}</span> : null}
        <div className={styles.text}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </div>
      </div>
      {change !== undefined ? (
        <span className={styles.change}>
          <span
            className={`${styles.changeValue} ${isPositive ? styles.changeUp : styles.changeDown}`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel}
        </span>
      ) : null}
    </div>
  );
};
