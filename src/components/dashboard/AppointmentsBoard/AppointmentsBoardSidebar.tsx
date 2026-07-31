'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { AppointmentStatus } from '@/common/types/appointment';
import { HelpCircleIcon } from '@/components/icons/icons';
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
  /** Hides the doctor filter checklist — pointless when there's only ever one doctor to filter by. */
  showDoctorFilter?: boolean;
  className?: string;
};

export const AppointmentsBoardSidebar = ({
  doctors,
  selectedDoctorIds,
  onToggleDoctor,
  onToggleAll,
  showDoctorFilter = true,
  className,
}: AppointmentsBoardSidebarProps) => {
  const { t } = useTranslation();
  const allSelected = doctors.length > 0 && selectedDoctorIds.size === doctors.length;
  const someSelected = selectedDoctorIds.size > 0 && !allSelected;

  const legendPopoverRef = useRef<HTMLDivElement>(null);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  useEffect(() => {
    if (!isLegendOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (legendPopoverRef.current && !legendPopoverRef.current.contains(event.target as Node)) {
        setIsLegendOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLegendOpen]);

  const legendItems = (
    <>
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
    </>
  );

  return (
    <aside className={`${styles.sidebar} ${className ?? ''}`}>
      {showDoctorFilter ? (
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
      ) : null}

      {/* Desktop: legend shown inline. */}
      <div className={`${styles.legend} ${!showDoctorFilter ? styles.legendNoTopBorder : ''}`}>
        {legendItems}
      </div>

      {/* Mobile: legend collapsed behind a "?" trigger to save vertical space. */}
      <div className={styles.legendMobile} ref={legendPopoverRef}>
        <button
          type="button"
          className={styles.legendTrigger}
          aria-label={t.appointments.legendTitle}
          title={t.appointments.legendTitle}
          onClick={() => setIsLegendOpen((prev) => !prev)}
        >
          <HelpCircleIcon size={18} />
        </button>

        {isLegendOpen ? <div className={styles.legendPopover}>{legendItems}</div> : null}
      </div>
    </aside>
  );
};
