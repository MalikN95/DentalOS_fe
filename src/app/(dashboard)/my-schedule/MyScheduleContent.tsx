'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { DoctorScheduleExceptions } from '@/components/staff/DoctorScheduleExceptions/DoctorScheduleExceptions';
import { DoctorScheduleSection } from '@/components/staff/DoctorScheduleSection/DoctorScheduleSection';
import { useMyDoctorProfile } from '@/hooks/useMyDoctorProfile';
import styles from './MyScheduleContent.module.css';

export const MyScheduleContent = () => {
  const { t } = useTranslation();
  const { doctorProfileId, branchId, isLoading, errorMessage } = useMyDoctorProfile();

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.doctorSchedule.title}</h1>

      <div className={styles.card}>
        {isLoading ? <p className={styles.hint}>{t.common.loading}</p> : null}
        {!isLoading && errorMessage ? <p className={styles.hint}>{errorMessage}</p> : null}

        {!isLoading && !errorMessage && !doctorProfileId ? (
          <p className={styles.hint}>{t.doctorSchedule.noProfile}</p>
        ) : null}

        {!isLoading && doctorProfileId ? (
          <DoctorScheduleSection doctorProfileId={doctorProfileId} branchId={branchId} readOnly />
        ) : null}
      </div>

      {!isLoading && doctorProfileId ? (
        <div className={styles.card}>
          <h2 className={styles.subtitle}>{t.scheduleExceptions.title}</h2>
          <DoctorScheduleExceptions doctorProfileId={doctorProfileId} />
        </div>
      ) : null}
    </div>
  );
};
