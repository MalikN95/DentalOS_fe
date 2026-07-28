'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { MailIcon, MessageIcon, PlusIcon, ZapIcon } from '@/components/icons/icons';
import styles from './PatientActions.module.css';

type PatientActionsProps = {
  onAddAppointment: () => void;
  onSendSms?: () => void;
  onSendEmail?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientActions = ({
  onAddAppointment,
  onSendSms,
  onSendEmail,
  className,
  style,
}: PatientActionsProps) => {
  const { t } = useTranslation();

  return (
    <section className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <span className={styles.headerIcon}>
        <ZapIcon size={13} />
      </span>
      <h2 className={styles.heading}>{t.patientActions.title}</h2>

      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.appointmentButton}`}
          onClick={onAddAppointment}
        >
          <PlusIcon size={14} />
          {t.patientActions.newAppointment}
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.smsButton}`}
          onClick={onSendSms}
        >
          <MessageIcon size={14} />
          {t.patientActions.sendSms}
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.emailButton}`}
          onClick={onSendEmail}
        >
          <MailIcon size={14} />
          {t.patientActions.sendEmail}
        </button>
      </div>
    </section>
  );
};
