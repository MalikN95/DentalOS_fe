'use client';

import { ScheduleSlot } from '@/common/types/appointment';
import { useTranslation } from '@/common/locale/LocaleProvider';
import styles from './ScheduleList.module.css';

type ScheduleListProps = {
  slots: ScheduleSlot[];
  className?: string;
  style?: React.CSSProperties;
};

const barClass: Record<ScheduleSlot['color'], string> = {
  primary: styles.barPrimary,
  success: styles.barSuccess,
  danger: styles.barDanger,
  gray: styles.barGray,
};

export const ScheduleList = ({ slots, className, style }: ScheduleListProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <span className={styles.title}>{t.dashboard.upcoming}</span>
      {slots.map((slot) => (
        <div key={slot.id} className={styles.slot}>
          <span className={styles.time}>{slot.time}</span>
          <span className={`${styles.bar} ${barClass[slot.color]}`} />
          <span className={styles.info}>
            <span className={styles.patient}>{slot.patientName}</span>
            <span className={styles.service}>
              {slot.service} · {slot.doctorName}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};
