import { Appointment, AppointmentStatus } from '@/common/types/appointment';
import { Badge, BadgeColor, Button } from '@/components/ui';
import styles from './AppointmentsTable.module.css';

type AppointmentsTableProps = {
  appointments: Appointment[];
  className?: string;
  style?: React.CSSProperties;
  onAddClick?: () => void;
};

const statusConfig: Record<AppointmentStatus, { label: string; color: BadgeColor }> = {
  scheduled: { label: 'Запланирована', color: 'primary' },
  in_progress: { label: 'Идёт приём', color: 'gray' },
  completed: { label: 'Завершена', color: 'success' },
  cancelled: { label: 'Отменена', color: 'danger' },
};

export const AppointmentsTable = ({
  appointments,
  className,
  style,
  onAddClick,
}: AppointmentsTableProps) => (
  <div className={`${styles.card} ${className ?? ''}`} style={style}>
    <div className={styles.cardHeader}>
      <span className={styles.cardTitle}>Записи на сегодня</span>
      <Button variant="soft" onClick={onAddClick}>
        + Новая запись
      </Button>
    </div>

    <table className={styles.table}>
      <thead>
        <tr>
          <th>Время</th>
          <th>Пациент</th>
          <th>Услуга</th>
          <th>Врач</th>
          <th>Кабинет</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((appointment) => (
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
              <Badge color={statusConfig[appointment.status].color}>
                {statusConfig[appointment.status].label}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
