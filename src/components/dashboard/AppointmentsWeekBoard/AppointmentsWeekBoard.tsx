'use client';

import { Fragment, useMemo } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { Alert } from '@/components/ui';
import { AppointmentsBoardSidebar } from '@/components/dashboard/AppointmentsBoard/AppointmentsBoardSidebar';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import {
  formatHourLabel,
  getBoardHourRange,
  groupAppointmentsByDate,
  groupAppointmentsByHour,
} from '@/helpers/appointments-board';
import { getWeekDays, isSameDay, toDateInputValue } from '@/helpers/date';
import { useDoctorFilter } from '@/hooks/useDoctorFilter';
import styles from './AppointmentsWeekBoard.module.css';

type AppointmentsWeekBoardProps = {
  appointments: Appointment[];
  isLoading?: boolean;
  errorMessage?: string | null;
  date: Date;
  onDayClick: (date: Date) => void;
  onCardClick: (appointment: Appointment) => void;
  /** Hides the doctor filter checklist — pointless when there's only ever one doctor to filter by. */
  showDoctorFilter?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const AppointmentsWeekBoard = ({
  appointments,
  isLoading = false,
  errorMessage = null,
  date,
  onDayClick,
  onCardClick,
  showDoctorFilter = true,
  className,
  style,
}: AppointmentsWeekBoardProps) => {
  const { t, language } = useTranslation();
  const weekDays = useMemo(() => getWeekDays(date), [date]);
  const { doctors, selectedDoctorIds, toggleDoctor, toggleAll, visibleAppointments } =
    useDoctorFilter(appointments);
  const hours = useMemo(() => getBoardHourRange(visibleAppointments), [visibleAppointments]);
  const appointmentsByDate = useMemo(
    () => groupAppointmentsByDate(visibleAppointments),
    [visibleAppointments],
  );
  const today = new Date();

  const showLoading = isLoading;
  const showEmpty = !isLoading && appointments.length === 0;

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

        <div className={styles.grid}>
          <div className={styles.cornerCell} style={{ gridRow: 1, gridColumn: 1 }} />
          {weekDays.map((day, dayIndex) => (
            <button
              key={toDateInputValue(day)}
              type="button"
              className={`${styles.dayHeader} ${isSameDay(day, today) ? styles.dayHeaderToday : ''}`}
              style={{ gridRow: 1, gridColumn: dayIndex + 2 }}
              onClick={() => onDayClick(day)}
            >
              <span className={styles.dayHeaderWeekday}>
                {day.toLocaleDateString(language, { weekday: 'short' })}
              </span>
              <span className={styles.dayHeaderNumber}>{day.getDate()}</span>
            </button>
          ))}

          {showLoading || showEmpty ? (
            <div className={styles.stateBlock} style={{ gridRow: 2 }}>
              {showLoading ? t.appointments.loading : t.appointments.empty}
            </div>
          ) : (
            hours.map((hour, hourIndex) => (
              // Every cell gets an explicit gridRow/gridColumn rather than relying on
              // implicit auto-placement counting 8 items per row — a Fragment grouping
              // 1 label + 7 cells per hour is still correct DOM-wise, but explicit
              // coordinates make placement immune to any browser auto-placement quirk,
              // and let each row grow independently to fit its busiest day.
              <Fragment key={hour}>
                <div className={styles.hourLabel} style={{ gridRow: hourIndex + 2, gridColumn: 1 }}>
                  {formatHourLabel(hour)}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const dayAppointments = appointmentsByDate.get(toDateInputValue(day)) ?? [];
                  const cellAppointments = groupAppointmentsByHour(dayAppointments).get(hour) ?? [];

                  return (
                    <div
                      key={toDateInputValue(day)}
                      className={styles.cell}
                      style={{ gridRow: hourIndex + 2, gridColumn: dayIndex + 2 }}
                    >
                      {cellAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          className={styles.chip}
                          data-color={appointmentStatusColor[appointment.status]}
                          title={`${appointment.time}–${appointment.endTime} ${appointment.patientName}`}
                          onClick={() => onCardClick(appointment)}
                        >
                          <span className={styles.chipTime}>{appointment.time}</span>
                          <span className={styles.chipName}>{appointment.patientName}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
