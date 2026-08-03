'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PortalLoginStep } from '@/hooks/usePortalLogin';
import { Alert, Button, TextField } from '@/components/ui';
import styles from './PhoneOtpForm.module.css';

type PhoneOtpFormProps = {
  step: PortalLoginStep;
  phone: string;
  code: string;
  isSubmitting: boolean;
  error: string | null;
  resendCooldown: number;
  className?: string;
  style?: React.CSSProperties;
  onPhoneChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onSubmitPhone: () => void;
  onSubmitCode: () => void;
  onChangePhone: () => void;
  onResendCode: () => void;
};

export const PhoneOtpForm = ({
  step,
  phone,
  code,
  isSubmitting,
  error,
  resendCooldown,
  className,
  style,
  onPhoneChange,
  onCodeChange,
  onSubmitPhone,
  onSubmitCode,
  onChangePhone,
  onResendCode,
}: PhoneOtpFormProps) => {
  const { t } = useTranslation();

  return (
    <form
      className={`${styles.form} ${className ?? ''}`}
      style={style}
      onSubmit={(event) => {
        event.preventDefault();
        if (step === 'phone') {
          onSubmitPhone();
        } else {
          onSubmitCode();
        }
      }}
    >
      <h1 className={styles.title}>{t.patientPortal.loginTitle}</h1>
      <p className={styles.subtitle}>
        {step === 'phone' ? t.patientPortal.loginSubtitle : t.patientPortal.codeSubtitle}
      </p>

      {error ? <Alert color="danger">{error}</Alert> : null}

      {step === 'phone' ? (
        <>
          <TextField
            label={t.patientPortal.phoneLabel}
            type="tel"
            autoComplete="tel"
            placeholder={t.patientPortal.phonePlaceholder}
            value={phone}
            disabled={isSubmitting}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {t.patientPortal.requestCodeButton}
          </Button>
        </>
      ) : (
        <>
          <TextField
            label={t.patientPortal.codeLabel}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            placeholder={t.patientPortal.codePlaceholder}
            value={code}
            disabled={isSubmitting}
            onChange={(event) => onCodeChange(event.target.value)}
          />
          <Button type="submit" disabled={isSubmitting} className={styles.submitButton}>
            {t.patientPortal.verifyButton}
          </Button>

          <div className={styles.linkRow}>
            <button type="button" className={styles.linkButton} onClick={onChangePhone}>
              {t.patientPortal.changePhone}
            </button>
            <button
              type="button"
              className={styles.linkButton}
              disabled={resendCooldown > 0}
              onClick={onResendCode}
            >
              {resendCooldown > 0
                ? `${t.patientPortal.resendCodeIn} ${resendCooldown}s`
                : t.patientPortal.resendCode}
            </button>
          </div>
        </>
      )}
    </form>
  );
};
