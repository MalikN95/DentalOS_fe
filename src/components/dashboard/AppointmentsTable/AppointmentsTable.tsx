'use client';

import { Appointment } from '@/common/types/appointment';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Badge, Button } from '@/components/ui';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import styles from './AppointmentsTable.module.css';

type AppointmentsTableProps = {
  appointments: Appointment[];
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onAddClick?: () => void;
};

export const AppointmentsTable = ({
  appointments,
  isLoading = false,
  errorMessage = null,
  className,
  style,
  onAddClick,
}: AppointmentsTableProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{t.appointments.todayTitle}</span>
        <Button variant="soft" onClick={onAddClick}>
          {t.appointments.newAppointment}
        </Button>
      </div>

      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t.appointments.colTime}</th>
            <th>{t.appointments.colPatient}</th>
            <th>{t.appointments.colService}</th>
            <th>{t.appointments.colDoctor}</th>
            <th>{t.appointments.colCabinet}</th>
            <th>{t.appointments.colStatus}</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td className={styles.stateCell} colSpan={6}>
                {t.appointments.loading}
              </td>
            </tr>
          ) : null}

          {!isLoading && appointments.length === 0 ? (
            <tr>
              <td className={styles.stateCell} colSpan={6}>
                {t.appointments.empty}
              </td>
            </tr>
          ) : null}

          {!isLoading
            ? appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className={styles.time}>{appointment.time}</td>
                  <td>
                    <span className={styles.patient}>
                      <span className={styles.patientName}>{appointment.patientName}</span>
                      <span className={styles.patientPhone}>{appointment.patientPhone}</span>
                    </span>
                  </td>
                  <td>{appointment.service}</td>
                  <td>{appointment.doctorName}</td>
                  <td>{appointment.cabinet}</td>
                  <td>
                    <Badge color={appointmentStatusColor[appointment.status]}>
                      {t.appointmentStatus[appointment.status]}
                    </Badge>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
};
