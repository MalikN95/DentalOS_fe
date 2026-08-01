'use client';

import type { BookingDoctor } from '@/common/types/booking';
import { getInitials } from '@/helpers/initials';
import styles from './BookingDoctorSummary.module.css';

type BookingDoctorSummaryProps = {
  doctor: BookingDoctor;
  className?: string;
};

export const BookingDoctorSummary = ({ doctor, className }: BookingDoctorSummaryProps) => {
  const name = `${doctor.firstName} ${doctor.lastName}`.trim();

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <span className={styles.avatar}>
        {doctor.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL
          <img src={doctor.photoUrl} alt="" className={styles.avatarImage} />
        ) : (
          getInitials(name)
        )}
      </span>
      <span className={styles.info}>
        <span className={styles.name}>{name}</span>
        {doctor.specializations.length > 0 ? (
          <span className={styles.specializations}>{doctor.specializations.join(', ')}</span>
        ) : null}
      </span>
    </div>
  );
};
