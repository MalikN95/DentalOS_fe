'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { AppointmentStatus } from '@/common/types/appointment';
import { Checkbox } from '@/components/ui';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import styles from './AppointmentsBoardSidebar.module.css';

export type BoardDoctorOption = {
  id: string;
  name: string;
};

const STATUS_ORDER: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'arrived',
  'in_treatment',
  'completed',
  'cancelled',
  'no_show',
];

type AppointmentsBoardSidebarProps = {
  doctors: BoardDoctorOption[];
  selectedDoctorIds: Set<string>;
  onToggleDoctor: (doctorId: string) => void;
  onToggleAll: () => void;
  className?: string;
};

export const AppointmentsBoardSidebar = ({
  doctors,
  selectedDoctorIds,
  onToggleDoctor,
  onToggleAll,
  className,
}: AppointmentsBoardSidebarProps) => {
  const { t } = useTranslation();
  const allSelected = doctors.length > 0 && selectedDoctorIds.size === doctors.length;
  const someSelected = selectedDoctorIds.size > 0 && !allSelected;

  return (
    <aside className={`${styles.sidebar} ${className ?? ''}`}>
      <div className={styles.doctors}>
        {doctors.length > 0 ? (
          <Checkbox
            className={styles.selectAll}
            label={t.appointments.selectAllDoctors}
            checked={allSelected}
            indeterminate={someSelected}
            onChange={onToggleAll}
          />
        ) : (
          <span className={styles.empty}>{t.appointments.noDoctorsToday}</span>
        )}

        <div className={styles.doctorList}>
          {doctors.map((doctor) => (
            <Checkbox
              key={doctor.id}
              className={styles.doctorItem}
              label={doctor.name}
              checked={selectedDoctorIds.has(doctor.id)}
              onChange={() => onToggleDoctor(doctor.id)}
            />
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendTitle}>{t.appointments.legendTitle}</span>
        <span className={styles.legendRow}>
          <span className={styles.legendBar} data-tone="first" />
          {t.appointments.firstAppointmentHint}
        </span>
        <span className={styles.legendRow}>
          <span className={styles.legendBar} data-tone="cancelled" />
          {t.appointments.cancelledHint}
        </span>
        {STATUS_ORDER.map((status) => (
          <span key={status} className={styles.legendRow}>
            <span className={styles.legendDot} data-color={appointmentStatusColor[status]} />
            {t.appointmentStatus[status]}
          </span>
        ))}
      </div>
    </aside>
  );
};
