'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingConfirmation } from '@/common/types/booking';
import type { BookingLoginLinkStatus } from '@/hooks/useBookingLoginLink';
import type { PushPermissionStatus } from '@/hooks/useBookingWizard';
import { CheckIcon } from '@/components/icons/icons';
import { Alert, Button } from '@/components/ui';
import { formatDate, formatTime } from '@/helpers/date';
import styles from './BookingConfirmationStep.module.css';

type BookingConfirmationStepProps = {
  confirmation: BookingConfirmation;
  pushPermission: PushPermissionStatus;
  onEnableNotifications: () => void;
  canInstallApp: boolean;
  onInstallApp: () => void;
  onBookAnother: () => void;
  loginLinkStatus: BookingLoginLinkStatus;
  loginLinkError: string | null;
  onRequestLogin: () => void;
};

export const BookingConfirmationStep = ({
  confirmation,
  pushPermission,
  onEnableNotifications,
  canInstallApp,
  onInstallApp,
  onBookAnother,
  loginLinkStatus,
  loginLinkError,
  onRequestLogin,
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
        <p className={styles.portalPromoText}>
          {loginLinkStatus === 'sent' ? t.confirmationPortalSentText : t.confirmationPortalText}
        </p>
        {loginLinkError ? <Alert color="danger">{loginLinkError}</Alert> : null}
        {loginLinkStatus !== 'sent' ? (
          <Button
            className={styles.portalPromoButton}
            disabled={loginLinkStatus === 'sending'}
            onClick={onRequestLogin}
          >
            {t.confirmationPortalCta}
          </Button>
        ) : null}
      </div>

      <Button className={styles.again} variant="soft" color="gray" onClick={onBookAnother}>
        {t.confirmationAgain}
      </Button>
    </div>
  );
};
