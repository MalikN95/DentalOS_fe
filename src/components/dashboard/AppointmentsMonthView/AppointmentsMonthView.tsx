'use client';

import { useMemo } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { AppointmentsBoardSidebar } from '@/components/dashboard/AppointmentsBoard/AppointmentsBoardSidebar';
import { Alert } from '@/components/ui';
import {
  groupAppointmentsByDate,
  summarizeAppointmentsByOutcome,
} from '@/helpers/appointments-board';
import { getMonthMatrix, isSameDay, toDateInputValue } from '@/helpers/date';
import { useDoctorFilter } from '@/hooks/useDoctorFilter';
import styles from './AppointmentsMonthView.module.css';

const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type AppointmentsMonthViewProps = {
  appointments: Appointment[];
  isLoading?: boolean;
  errorMessage?: string | null;
  date: Date;
  onSelectDay: (date: Date) => void;
  /** Hides the doctor filter checklist — pointless when there's only ever one doctor to filter by. */
  showDoctorFilter?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const AppointmentsMonthView = ({
  appointments,
  isLoading = false,
  errorMessage = null,
  date,
  onSelectDay,
  showDoctorFilter = true,
  className,
  style,
}: AppointmentsMonthViewProps) => {
  const { t } = useTranslation();
  const weeks = useMemo(() => getMonthMatrix(date), [date]);
  const { doctors, selectedDoctorIds, toggleDoctor, toggleAll, visibleAppointments } =
    useDoctorFilter(appointments);
  const appointmentsByDate = useMemo(
    () => groupAppointmentsByDate(visibleAppointments),
    [visibleAppointments],
  );
  const today = new Date();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div className={styles.body}>
        <AppointmentsBoardSidebar
          doctors={doctors}
          selectedDoctorIds={selectedDoctorIds}
          onToggleDoctor={toggleDoctor}
          onToggleAll={toggleAll}
          showDoctorFilter={showDoctorFilter}
        />

        <div className={styles.mainArea}>
          <div className={styles.weekdayRow}>
            {WEEKDAY_ORDER.map((weekday) => (
              <span key={weekday} className={styles.weekdayLabel}>
                {t.weekdaysShort[weekday]}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {weeks.flat().map((day) => {
              const dayAppointments = appointmentsByDate.get(toDateInputValue(day)) ?? [];
              const summary = summarizeAppointmentsByOutcome(dayAppointments);
              const isCurrentMonth = day.getMonth() === date.getMonth();

              return (
                <button
                  key={toDateInputValue(day)}
                  type="button"
                  className={`${styles.day} ${isCurrentMonth ? '' : styles.dayOutside} ${
                    isSameDay(day, today) ? styles.dayToday : ''
                  }`}
                  onClick={() => onSelectDay(day)}
                >
                  <span className={styles.dayNumber}>{day.getDate()}</span>
                  {dayAppointments.length > 0 ? (
                    <span className={styles.summaryRow}>
                      {summary.pending > 0 ? (
                        <span className={styles.pill} data-color="primary">
                          {format(t.appointments.pendingCount, { count: summary.pending })}
                        </span>
                      ) : null}
                      {summary.arrived > 0 ? (
                        <span className={styles.pill} data-color="success">
                          {format(t.appointments.arrivedCount, { count: summary.arrived })}
                        </span>
                      ) : null}
                      {summary.cancelled > 0 ? (
                        <span className={styles.pill} data-color="danger">
                          {format(t.appointments.cancelledCount, { count: summary.cancelled })}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {isLoading ? <div className={styles.stateBlock}>{t.appointments.loading}</div> : null}
        </div>
      </div>
    </div>
  );
};
