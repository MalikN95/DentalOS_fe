'use client';

import { useMemo } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { Alert, Button } from '@/components/ui';
import {
  formatHourLabel,
  getBoardHourRange,
  groupAppointmentsByHour,
} from '@/helpers/appointments-board';
import { useDoctorFilter } from '@/hooks/useDoctorFilter';
import { AppointmentPatientCard } from './AppointmentPatientCard';
import { AppointmentsBoardSidebar } from './AppointmentsBoardSidebar';
import styles from './AppointmentsBoard.module.css';

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
  /** The day being shown — passed through to each card for its "not started yet" check. Defaults to today. */
  date?: Date;
  /** Shown in the card header in place of a date nav — omit when a calendar nav already renders above the board. */
  title?: string;
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
  date,
  title,
  showDoctorFilter = true,
}: AppointmentsBoardProps) => {
  const { t } = useTranslation();
  const hours = useMemo(() => getBoardHourRange(appointments), [appointments]);
  const { doctors, selectedDoctorIds, toggleDoctor, toggleAll, visibleAppointments } =
    useDoctorFilter(appointments);
  const appointmentsByHour = useMemo(
    () => groupAppointmentsByHour(visibleAppointments),
    [visibleAppointments],
  );
  const showLoading = isLoading;
  const showEmpty = !isLoading && appointments.length === 0;

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div
        className={`${styles.cardHeader} ${!title && showDoctorFilter ? styles.cardHeaderMobileCollapsed : ''}`}
      >
        <span className={styles.cardTitle}>{title ?? ''}</span>

        <Button
          variant="soft"
          className={`${styles.addButton} ${showDoctorFilter ? styles.addButtonDesktopOnly : ''}`}
          onClick={onAddClick}
        >
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
          onToggleDoctor={toggleDoctor}
          onToggleAll={toggleAll}
          showDoctorFilter={showDoctorFilter}
          mobileAction={
            showDoctorFilter ? (
              <Button variant="soft" className={styles.mobileAddButton} onClick={onAddClick}>
                {t.appointments.newAppointmentShort}
              </Button>
            ) : null
          }
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
                            date={date}
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
