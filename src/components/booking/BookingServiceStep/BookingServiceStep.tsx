'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingServiceCategory } from '@/common/types/booking';
import { formatMoney } from '@/helpers/appointment-status';
import styles from './BookingServiceStep.module.css';

type BookingServiceStepProps = {
  categories: BookingServiceCategory[];
  currency: string;
  onSelect: (id: string) => void;
};

export const BookingServiceStep = ({ categories, currency, onSelect }: BookingServiceStepProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;
  const hasServices = categories.some((category) => category.services.length > 0);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t.serviceTitle}</h1>

      {!hasServices ? <p className={styles.empty}>{t.noServices}</p> : null}

      <div className={styles.categories}>
        {categories.map((category) => (
          <div key={category.id ?? 'uncategorized'} className={styles.category}>
            <span className={styles.categoryName}>{category.name ?? t.otherCategory}</span>
            <div className={styles.list}>
              {category.services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  className={styles.card}
                  onClick={() => onSelect(service.id)}
                >
                  <span className={styles.name}>{service.name}</span>
                  <span className={styles.meta}>
                    <span>{format(t.serviceDuration, { minutes: service.durationMinutes })}</span>
                    <span className={styles.price}>{formatMoney(service.price, currency)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
