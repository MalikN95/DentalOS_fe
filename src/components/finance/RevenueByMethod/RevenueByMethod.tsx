'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { RevenueByMethodItem } from '@/common/types/analytics';
import { formatMoney } from '@/helpers/appointment-status';
import styles from './RevenueByMethod.module.css';

type RevenueByMethodProps = {
  items: RevenueByMethodItem[];
  currency: string;
  isLoading?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const RevenueByMethod = ({
  items,
  currency,
  isLoading = false,
  className,
  style,
}: RevenueByMethodProps) => {
  const { t } = useTranslation();
  const maxAmount = Math.max(...items.map((item) => item.amount), 0);

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <span className={styles.title}>{t.finance.methodBreakdownTitle}</span>

      {isLoading ? <p className={styles.state}>{t.finance.loading}</p> : null}

      {!isLoading && items.length === 0 ? (
        <p className={styles.state}>{t.finance.empty}</p>
      ) : null}

      {!isLoading && items.length > 0 ? (
        <div className={styles.rows}>
          {items.map((item) => (
            <div key={item.method} className={styles.row}>
              <span className={styles.label}>{t.paymentMethods[item.method]}</span>
              <div className={styles.track}>
                <div
                  className={styles.fill}
                  style={{ width: `${maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0}%` }}
                />
              </div>
              <span className={styles.value}>{formatMoney(String(item.amount), currency)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
