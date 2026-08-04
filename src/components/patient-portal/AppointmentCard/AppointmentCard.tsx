'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PatientPortalAppointment, PatientPortalReview } from '@/common/types/patient-portal';
import { StarRatingInput } from '@/components/patient-portal/StarRatingInput/StarRatingInput';
import { Badge, Button } from '@/components/ui';
import { appointmentStatusColor, formatMoney } from '@/helpers/appointment-status';
import { formatDate, formatTime } from '@/helpers/date';
import styles from './AppointmentCard.module.css';

type AppointmentCardProps = {
  appointment: PatientPortalAppointment;
  /** Only meaningful once the appointment is completed. */
  review?: PatientPortalReview | null;
  /** Clinic's configured currency (ISO code, e.g. "RUB"/"USD"). Defaults to RUB when unknown. */
  currency?: string;
  className?: string;
  style?: React.CSSProperties;
  onCancel?: (appointment: PatientPortalAppointment) => void;
  onReview?: (appointment: PatientPortalAppointment) => void;
};

export const AppointmentCard = ({
  appointment,
  review,
  currency,
  className,
  style,
  onCancel,
  onReview,
}: AppointmentCardProps) => {
  const { t } = useTranslation();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.topRow}>
        <div>
          <span className={styles.date}>{formatDate(appointment.startsAt)}</span>
          <span className={styles.time}>
            {' '}
            · {formatTime(appointment.startsAt)}–{formatTime(appointment.endsAt)}
          </span>
        </div>
        <Badge color={appointmentStatusColor[appointment.status]}>
          {t.appointmentStatus[appointment.status]}
        </Badge>
      </div>

      <span className={styles.service}>{appointment.serviceName}</span>

      <div className={styles.meta}>
        <span>
          {t.patientPortal.doctorLabel}: {appointment.doctorName}
        </span>
        <span>
          {t.patientPortal.branchLabel}: {appointment.branchName}
        </span>
      </div>

      <div className={styles.bottomRow}>
        <span className={styles.price}>{formatMoney(appointment.price, currency)}</span>

        {appointment.isCancellable && onCancel ? (
          <Button
            className={styles.cancelButton}
            color="danger"
            variant="soft"
            onClick={() => onCancel(appointment)}
          >
            {t.patientPortal.cancelButton}
          </Button>
        ) : null}
      </div>

      {appointment.cancellationReason ? (
        <span className={styles.cancellationReason}>{appointment.cancellationReason}</span>
      ) : null}

      {appointment.status === 'completed' && onReview ? (
        <div className={styles.reviewRow}>
          {review ? (
            <>
              <StarRatingInput rating={review.rating} size={16} />
              <button type="button" className={styles.reviewLink} onClick={() => onReview(appointment)}>
                {t.patientPortal.editReview}
              </button>
            </>
          ) : (
            <button type="button" className={styles.reviewLink} onClick={() => onReview(appointment)}>
              {t.patientPortal.leaveReview}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
