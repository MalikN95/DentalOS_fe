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

// A cell's row height is set explicitly in JS (rather than left to CSS grid's
// auto-row-sizing) — a grid row's track height is supposed to auto-fit its
// tallest flex-column cell, but that intrinsic-sizing computation for a flex
// container nested inside a grid item is exactly where some engines get it
// wrong, which is what caused chips to overlap the row below when a cell had
// many stacked appointments. Computing the height ourselves from the actual
// chip count sidesteps that entirely.
const CHIP_HEIGHT = 35;
const CHIP_GAP = 3;
const CELL_PADDING = 4;
const CELL_BORDER = 1;
const MIN_ROW_HEIGHT = 40;
// A little slack over the exact chip math so sub-pixel text rendering never
// clips a chip — better a couple of spare pixels of empty space than a
// scrollbar or a clipped line.
const ROW_HEIGHT_BUFFER = 4;

const getRowHeight = (maxChipCount: number): number =>
  maxChipCount === 0
    ? MIN_ROW_HEIGHT
    : Math.max(
        MIN_ROW_HEIGHT,
        maxChipCount * CHIP_HEIGHT +
          (maxChipCount - 1) * CHIP_GAP +
          CELL_PADDING * 2 +
          CELL_BORDER +
          ROW_HEIGHT_BUFFER,
      );

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
            hours.map((hour, hourIndex) => {
              // Every cell gets an explicit gridRow/gridColumn rather than relying on
              // implicit auto-placement counting 8 items per row — a Fragment grouping
              // 1 label + 7 cells per hour is still correct DOM-wise, but explicit
              // coordinates make placement immune to any browser auto-placement quirk.
              const dayCellAppointments = weekDays.map((day) => {
                const dayAppointments = appointmentsByDate.get(toDateInputValue(day)) ?? [];
                return groupAppointmentsByHour(dayAppointments).get(hour) ?? [];
              });
              const rowHeight = getRowHeight(
                Math.max(...dayCellAppointments.map((list) => list.length), 0),
              );

              return (
                <Fragment key={hour}>
                  <div
                    className={styles.hourLabel}
                    style={{ gridRow: hourIndex + 2, gridColumn: 1, height: rowHeight }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={toDateInputValue(day)}
                      className={styles.cell}
                      style={{
                        gridRow: hourIndex + 2,
                        gridColumn: dayIndex + 2,
                        height: rowHeight,
                      }}
                    >
                      {dayCellAppointments[dayIndex].map((appointment) => (
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
                  ))}
                </Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
