'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { CalendarIcon } from '@/components/icons/icons';
import { Badge, PatientAvatar } from '@/components/ui';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import { formatDate } from '@/helpers/date';
import styles from './UpcomingAppointmentsCard.module.css';

type UpcomingAppointmentsCardProps = {
  appointments: Appointment[];
};

export const UpcomingAppointmentsCard = ({ appointments }: UpcomingAppointmentsCardProps) => {
  const { t: dict } = useTranslation();
  const t = dict.account;

  return (
    <div className={styles.card}>
      <span className={styles.title}>
        <CalendarIcon size={14} />
        {t.upcomingTitle}
      </span>

      {appointments.length === 0 ? (
        <p className={styles.emptyState}>{t.noUpcoming}</p>
      ) : (
        <ul className={styles.list}>
          {appointments.map((appointment) => (
            <li key={appointment.id}>
              <Link href={`/appointments/${appointment.id}`} className={styles.item}>
                <PatientAvatar size="sm" name={appointment.patientName} />
                <span className={styles.info}>
                  <span className={styles.name}>{appointment.patientName}</span>
                  <span className={styles.meta}>
                    {formatDate(appointment.date)} · {appointment.time}
                  </span>
                </span>
                <Badge color={appointmentStatusColor[appointment.status]} className={styles.badge}>
                  {dict.appointmentStatus[appointment.status]}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
