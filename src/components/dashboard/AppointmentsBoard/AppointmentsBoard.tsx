'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/icons';
import { Alert, Button } from '@/components/ui';
import { formatHourLabel, getBoardHourRange, groupAppointmentsByHour } from '@/helpers/appointments-board';
import { isSameDay, parseDateInputValue, toDateInputValue } from '@/helpers/date';
import { AppointmentPatientCard } from './AppointmentPatientCard';
import { AppointmentsBoardSidebar, type BoardDoctorOption } from './AppointmentsBoardSidebar';
import styles from './AppointmentsBoard.module.css';

const getBoardDoctors = (appointments: Appointment[]): BoardDoctorOption[] => {
  const byId = new Map<string, string>();
  appointments.forEach((appointment) => {
    if (!byId.has(appointment.doctorProfileId)) {
      byId.set(appointment.doctorProfileId, appointment.doctorName);
    }
  });
  return Array.from(byId, ([id, name]) => ({ id, name }));
};

type AppointmentsBoardDateNav = {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: (date: Date) => void;
};

type AppointmentsBoardProps = {
  appointments: Appointment[];
  currency: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onAddClick: () => void;
  onPatientClick: (patientId: string) => void;
  onRowClick: (appointment: Appointment) => void;
  dateNav?: AppointmentsBoardDateNav;
  /** Hides the doctor filter checklist — pointless when there's only ever one doctor to filter by. */
  showDoctorFilter?: boolean;
};

export const AppointmentsBoard = ({
  appointments,
  currency,
  isLoading = false,
  errorMessage = null,
  className,
  style,
  onAddClick,
  onPatientClick,
  onRowClick,
  dateNav,
  showDoctorFilter = true,
}: AppointmentsBoardProps) => {
  const { t, language } = useTranslation();
  const hours = useMemo(() => getBoardHourRange(appointments), [appointments]);
  const doctors = useMemo(() => getBoardDoctors(appointments), [appointments]);
  const doctorIdsKey = useMemo(
    () =>
      doctors
        .map((doctor) => doctor.id)
        .sort()
        .join(','),
    [doctors],
  );

  // Every doctor with an appointment today is visible by default; re-derived
  // whenever the set of doctors for the day actually changes (e.g. switching
  // dates), not on every appointments refetch. Reset-on-prop-change during
  // render (React's documented pattern), not an effect, so switching days
  // doesn't render once with the stale selection before catching up.
  const [prevDoctorIdsKey, setPrevDoctorIdsKey] = useState(doctorIdsKey);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<Set<string>>(
    () => new Set(doctorIdsKey ? doctorIdsKey.split(',') : []),
  );

  if (doctorIdsKey !== prevDoctorIdsKey) {
    setPrevDoctorIdsKey(doctorIdsKey);
    setSelectedDoctorIds(new Set(doctorIdsKey ? doctorIdsKey.split(',') : []));
  }

  const handleToggleDoctor = (doctorId: string) => {
    setSelectedDoctorIds((prev) => {
      const next = new Set(prev);
      if (next.has(doctorId)) {
        next.delete(doctorId);
      } else {
        next.add(doctorId);
      }
      return next;
    });
  };

  const handleToggleAllDoctors = () => {
    setSelectedDoctorIds((prev) =>
      prev.size === doctors.length ? new Set() : new Set(doctors.map((doctor) => doctor.id)),
    );
  };

  const visibleAppointments = useMemo(
    () => appointments.filter((appointment) => selectedDoctorIds.has(appointment.doctorProfileId)),
    [appointments, selectedDoctorIds],
  );
  const appointmentsByHour = useMemo(
    () => groupAppointmentsByHour(visibleAppointments),
    [visibleAppointments],
  );
  const showLoading = isLoading;
  const showEmpty = !isLoading && appointments.length === 0;

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.cardHeader}>
        {dateNav ? (
          <div className={styles.dateNav}>
            <button
              type="button"
              className={styles.navButton}
              onClick={dateNav.onPrevDay}
              aria-label={t.appointments.prevDay}
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className={styles.dateLabel}>
              {isSameDay(dateNav.date, new Date())
                ? t.appointments.today
                : dateNav.date.toLocaleDateString(language, {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'short',
                  })}
            </span>
            <button
              type="button"
              className={styles.navButton}
              onClick={dateNav.onNextDay}
              aria-label={t.appointments.nextDay}
            >
              <ChevronRightIcon size={16} />
            </button>
            <span className={styles.calendarTrigger}>
              <CalendarIcon size={15} className={styles.calendarIcon} />
              <input
                type="date"
                className={styles.calendarInput}
                value={toDateInputValue(dateNav.date)}
                aria-label={t.appointments.pickDate}
                onChange={(event) => {
                  if (event.target.value) {
                    dateNav.onSelectDate(parseDateInputValue(event.target.value));
                  }
                }}
              />
            </span>
          </div>
        ) : (
          <span className={styles.cardTitle}>{t.appointments.todayTitle}</span>
        )}
        <Button variant="soft" className={styles.addButton} onClick={onAddClick}>
          {t.appointments.newAppointment}
        </Button>
      </div>

      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div className={styles.body}>
        <AppointmentsBoardSidebar
          doctors={doctors}
          selectedDoctorIds={selectedDoctorIds}
          onToggleDoctor={handleToggleDoctor}
          onToggleAll={handleToggleAllDoctors}
          showDoctorFilter={showDoctorFilter}
        />

        <div className={styles.board}>
          {showLoading ? <div className={styles.stateBlock}>{t.appointments.loading}</div> : null}
          {showEmpty ? <div className={styles.stateBlock}>{t.appointments.empty}</div> : null}

          {!showLoading && !showEmpty
            ? hours.map((hour) => {
                const hourAppointments = appointmentsByHour.get(hour) ?? [];
                const isEmptyHour = hourAppointments.length === 0;

                return (
                  <div key={hour} className={styles.hourRow}>
                    <div className={styles.hourDivider}>
                      <span className={styles.hourLabel}>{formatHourLabel(hour)}</span>
                      <span className={styles.hourLine} />
                    </div>

                    {isEmptyHour ? null : (
                      <div className={styles.hourCards}>
                        {hourAppointments.map((appointment) => (
                          <AppointmentPatientCard
                            key={appointment.id}
                            appointment={appointment}
                            currency={currency}
                            date={dateNav?.date}
                            onOpenPatient={onPatientClick}
                            onOpenAppointment={onRowClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            : null}
        </div>
      </div>
    </div>
  );
};
