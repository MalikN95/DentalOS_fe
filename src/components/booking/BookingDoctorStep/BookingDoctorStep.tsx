'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingDoctor } from '@/common/types/booking';
import { StarIcon } from '@/components/icons/icons';
import { getInitials } from '@/helpers/initials';
import styles from './BookingDoctorStep.module.css';

type BookingDoctorStepProps = {
  doctors: BookingDoctor[];
  onSelect: (id: string) => void;
};

export const BookingDoctorStep = ({ doctors, onSelect }: BookingDoctorStepProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t.doctorTitle}</h1>

      {doctors.length === 0 ? <p className={styles.empty}>{t.noDoctors}</p> : null}

      <div className={styles.list}>
        {doctors.map((doctor) => {
          const name = `${doctor.firstName} ${doctor.lastName}`.trim();

          return (
            <button
              key={doctor.id}
              type="button"
              className={styles.card}
              onClick={() => onSelect(doctor.id)}
            >
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
                {doctor.experienceYears > 0 ? (
                  <span className={styles.experience}>
                    {format(t.doctorExperience, { years: doctor.experienceYears })}
                  </span>
                ) : null}
                {doctor.averageRating !== null ? (
                  <span className={styles.rating}>
                    <StarIcon size={14} filled className={styles.ratingStar} />
                    {format(t.doctorRating, {
                      rating: doctor.averageRating,
                      count: doctor.reviewCount,
                    })}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
