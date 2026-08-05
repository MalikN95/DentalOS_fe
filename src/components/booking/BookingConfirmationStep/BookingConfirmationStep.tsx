'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingConfirmation } from '@/common/types/booking';
import type { PushPermissionStatus } from '@/hooks/useBookingWizard';
import { CheckIcon } from '@/components/icons/icons';
import { Button } from '@/components/ui';
import { formatDate, formatTime } from '@/helpers/date';
import styles from './BookingConfirmationStep.module.css';

type BookingConfirmationStepProps = {
  confirmation: BookingConfirmation;
  clinicSlug: string;
  pushPermission: PushPermissionStatus;
  onEnableNotifications: () => void;
  canInstallApp: boolean;
  onInstallApp: () => void;
  onBookAnother: () => void;
};

export const BookingConfirmationStep = ({
  confirmation,
  clinicSlug,
  pushPermission,
  onEnableNotifications,
  canInstallApp,
  onInstallApp,
  onBookAnother,
}: BookingConfirmationStepProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;

  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>
        <CheckIcon size={28} />
      </span>

      <h1 className={styles.title}>{t.confirmationTitle}</h1>
      <p className={styles.text}>{t.confirmationText}</p>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span className={styles.label}>{t.confirmationAppointment}</span>
          <span>
            {formatDate(String(confirmation.startsAt))}, {formatTime(String(confirmation.startsAt))}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t.confirmationService}</span>
          <span>{confirmation.serviceName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t.confirmationDoctor}</span>
          <span>{confirmation.doctorName}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>{t.confirmationAddress}</span>
          <span>{confirmation.branchAddress}</span>
        </div>
      </div>

      {pushPermission !== 'granted' && pushPermission !== 'unsupported' ? (
        <div className={styles.portalPromo}>
          <span className={styles.portalPromoTitle}>{t.confirmationEnableNotificationsTitle}</span>
          <p className={styles.portalPromoText}>{t.confirmationEnableNotificationsText}</p>
          <Button className={styles.portalPromoButton} onClick={onEnableNotifications}>
            {t.confirmationEnableNotificationsCta}
          </Button>
        </div>
      ) : null}

      {canInstallApp ? (
        <div className={styles.portalPromo}>
          <span className={styles.portalPromoTitle}>{t.confirmationInstallAppTitle}</span>
          <p className={styles.portalPromoText}>{t.confirmationInstallAppText}</p>
          <Button className={styles.portalPromoButton} onClick={onInstallApp}>
            {t.confirmationInstallAppCta}
          </Button>
        </div>
      ) : null}

      <div className={styles.portalPromo}>
        <span className={styles.portalPromoTitle}>{t.confirmationPortalTitle}</span>
        <p className={styles.portalPromoText}>{t.confirmationPortalText}</p>
        <Link href={`/portal/${clinicSlug}`} className={styles.portalPromoLink}>
          <Button className={styles.portalPromoButton}>{t.confirmationPortalCta}</Button>
        </Link>
      </div>

      <Button className={styles.again} variant="soft" color="gray" onClick={onBookAnother}>
        {t.confirmationAgain}
      </Button>
    </div>
  );
};
