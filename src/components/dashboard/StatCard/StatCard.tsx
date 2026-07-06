import styles from './StatCard.module.css';

type StatCardProps = {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  className?: string;
  style?: React.CSSProperties;
};

export const StatCard = ({
  label,
  value,
  change,
  changeLabel,
  className,
  style,
}: StatCardProps) => {
  const isPositive = change >= 0;

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.change}>
        <span
          className={`${styles.changeValue} ${isPositive ? styles.changeUp : styles.changeDown}`}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        {changeLabel}
      </span>
    </div>
  );
};
