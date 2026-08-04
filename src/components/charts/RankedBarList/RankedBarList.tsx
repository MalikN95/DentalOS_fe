'use client';

import styles from './RankedBarList.module.css';

export type RankedBarItem = {
  label: string;
  value: number;
};

type RankedBarListProps = {
  items: RankedBarItem[];
  colorVar?: string;
  formatValue?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
};

export const RankedBarList = ({
  items,
  colorVar = '--color-primary-500',
  formatValue = (value) => String(value),
  className,
  style,
}: RankedBarListProps) => {
  const maxValue = Math.max(...items.map((item) => item.value), 0);

  return (
    <div className={`${styles.rows} ${className ?? ''}`} style={style}>
      {items.map((item) => (
        <div key={item.label} className={styles.row}>
          <span className={styles.label} title={item.label}>
            {item.label}
          </span>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{
                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                background: `var(${colorVar})`,
              }}
            />
          </div>
          <span className={styles.value}>{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
};
