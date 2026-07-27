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
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <ZapIcon size={18} />
        </span>
        <h2 className={styles.heading}>{t.patientActions.title}</h2>
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.appointmentButton}`}
          title={t.patientActions.newAppointment}
          aria-label={t.patientActions.newAppointment}
          onClick={onAddAppointment}
        >
          <PlusIcon size={28} />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.smsButton}`}
          title={t.patientActions.sendSms}
          aria-label={t.patientActions.sendSms}
          onClick={onSendSms}
        >
          <MessageIcon size={28} />
        </button>
        <button
          type="button"
          className={`${styles.iconButton} ${styles.emailButton}`}
          title={t.patientActions.sendEmail}
          aria-label={t.patientActions.sendEmail}
          onClick={onSendEmail}
        >
          <MailIcon size={28} />
        </button>
      </div>
    </section>
  );
};
