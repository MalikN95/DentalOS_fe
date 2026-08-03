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
import {
  formatMonthLabel,
  getMonthMatrix,
  getYearMonths,
  isSameDay,
  toDateInputValue,
} from '@/helpers/date';
import { useDoctorFilter } from '@/hooks/useDoctorFilter';
import styles from './AppointmentsYearView.module.css';

const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type AppointmentsYearViewProps = {
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

export const AppointmentsYearView = ({
  appointments,
  isLoading = false,
  errorMessage = null,
  date,
  onSelectDay,
  showDoctorFilter = true,
  className,
  style,
}: AppointmentsYearViewProps) => {
  const { t } = useTranslation();
  const months = useMemo(() => getYearMonths(date), [date]);
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
          {isLoading ? (
            <div className={styles.stateBlock}>{t.appointments.loading}</div>
          ) : (
            <div className={styles.yearGrid}>
              {months.map((month) => (
                <div key={toDateInputValue(month)} className={styles.month}>
                  <span className={styles.monthTitle}>{formatMonthLabel(month)}</span>

                  <div className={styles.weekdayRow}>
                    {WEEKDAY_ORDER.map((weekday) => (
                      <span key={weekday} className={styles.weekdayLabel}>
                        {t.weekdaysShort[weekday].charAt(0)}
                      </span>
                    ))}
                  </div>

                  <div className={styles.dayGrid}>
                    {getMonthMatrix(month)
                      .flat()
                      .map((day) => {
                        const dayAppointments = appointmentsByDate.get(toDateInputValue(day)) ?? [];
                        const summary = summarizeAppointmentsByOutcome(dayAppointments);
                        const isCurrentMonth = day.getMonth() === month.getMonth();
                        const title = [
                          summary.pending > 0
                            ? format(t.appointments.pendingCount, { count: summary.pending })
                            : null,
                          summary.arrived > 0
                            ? format(t.appointments.arrivedCount, { count: summary.arrived })
                            : null,
                          summary.cancelled > 0
                            ? format(t.appointments.cancelledCount, { count: summary.cancelled })
                            : null,
                        ]
                          .filter(Boolean)
                          .join(', ');

                        return (
                          <button
                            key={toDateInputValue(day)}
                            type="button"
                            className={`${styles.day} ${isCurrentMonth ? '' : styles.dayOutside} ${
                              isSameDay(day, today) ? styles.dayToday : ''
                            }`}
                            title={title || undefined}
                            onClick={() => onSelectDay(day)}
                          >
                            {day.getDate()}
                            {dayAppointments.length > 0 ? (
                              <span className={styles.dots}>
                                {summary.pending > 0 ? (
                                  <span className={styles.dot} data-color="primary" />
                                ) : null}
                                {summary.arrived > 0 ? (
                                  <span className={styles.dot} data-color="success" />
                                ) : null}
                                {summary.cancelled > 0 ? (
                                  <span className={styles.dot} data-color="danger" />
                                ) : null}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
