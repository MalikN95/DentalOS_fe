import { Appointment, AppointmentStatus } from '@/common/types/appointment';
import { Alert, Badge, BadgeColor, Button } from '@/components/ui';
import styles from './AppointmentsTable.module.css';

type AppointmentsTableProps = {
  appointments: Appointment[];
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onAddClick?: () => void;
};

const statusConfig: Record<AppointmentStatus, { label: string; color: BadgeColor }> = {
  pending: { label: 'Ожидает', color: 'primary' },
  confirmed: { label: 'Подтверждена', color: 'primary' },
  arrived: { label: 'Прибыл', color: 'gray' },
  in_treatment: { label: 'Идёт приём', color: 'gray' },
  completed: { label: 'Завершена', color: 'success' },
  cancelled: { label: 'Отменена', color: 'danger' },
  no_show: { label: 'Не явился', color: 'danger' },
};

export const AppointmentsTable = ({
  appointments,
  isLoading = false,
  errorMessage = null,
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

    {errorMessage ? (
      <div className={styles.stateWrap}>
        <Alert color="danger">{errorMessage}</Alert>
      </div>
    ) : null}

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
        {isLoading ? (
          <tr>
            <td className={styles.stateCell} colSpan={6}>
              Загрузка записей...
            </td>
          </tr>
        ) : null}

        {!isLoading && appointments.length === 0 ? (
          <tr>
            <td className={styles.stateCell} colSpan={6}>
              На сегодня записей нет
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
                  <Badge color={statusConfig[appointment.status].color}>
                    {statusConfig[appointment.status].label}
                  </Badge>
                </td>
              </tr>
            ))
          : null}
      </tbody>
    </table>
  </div>
);
