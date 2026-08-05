'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PortalLoginStep } from '@/hooks/usePortalLogin';
import { Alert, Button, PhoneField } from '@/components/ui';
import styles from './PhoneLinkForm.module.css';

type PhoneLinkFormProps = {
  step: PortalLoginStep;
  phone: string;
  isSubmitting: boolean;
  error: string | null;
  resendCooldown: number;
  className?: string;
  style?: React.CSSProperties;
  onPhoneChange: (value: string) => void;
  onSubmitPhone: () => void;
  onChangePhone: () => void;
  onResendLink: () => void;
};

export const PhoneLinkForm = ({
  step,
  phone,
  isSubmitting,
  error,
  resendCooldown,
  className,
  style,
  onPhoneChange,
  onSubmitPhone,
  onChangePhone,
  onResendLink,
}: PhoneLinkFormProps) => {
  const { t } = useTranslation();

  return (
    <form
      className={`${styles.form} ${className ?? ''}`}
      style={style}
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 'phone') {
          onSubmitPhone();
        }
      }}
    >
      <h1 className={styles.title}>
        {step === 'phone' ? t.patientPortal.loginTitle : t.patientPortal.linkSentTitle}
      </h1>
      <p className={styles.subtitle}>
        {step === 'phone' ? t.patientPortal.loginSubtitle : t.patientPortal.linkSentSubtitle}
      </p>

      {error ? <Alert color="danger">{error}</Alert> : null}

      {step === 'phone' ? (
        <>
          <PhoneField
            label={t.patientPortal.phoneLabel}
            value={phone}
            disabled={isSubmitting}
            onChange={onPhoneChange}
          />
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {t.patientPortal.requestLinkButton}
          </Button>
        </>
      ) : (
        <div className={styles.linkRow}>
          <button type="button" className={styles.linkButton} onClick={onChangePhone}>
            {t.patientPortal.changePhone}
          </button>
          <button
            type="button"
            className={styles.linkButton}
            disabled={resendCooldown > 0}
            onClick={onResendLink}
          >
            {resendCooldown > 0
              ? `${t.patientPortal.resendLinkIn} ${resendCooldown}s`
              : t.patientPortal.resendLink}
          </button>
        </div>
      )}
    </form>
  );
};
