'use client';

import { Logo } from '@/components/icons/icons';
import { PhoneOtpForm } from '@/components/patient-portal/PhoneOtpForm/PhoneOtpForm';
import { usePortalLogin } from '@/hooks/usePortalLogin';
import styles from './PortalLoginPageContent.module.css';

type PortalLoginPageContentProps = {
  clinicSlug: string;
};

export const PortalLoginPageContent = ({ clinicSlug }: PortalLoginPageContentProps) => {
  const {
    step,
    phone,
    setPhone,
    code,
    setCode,
    isSubmitting,
    error,
    resendCooldown,
    requestCode,
    verifyCode,
    changePhone,
    resendCode,
  } = usePortalLogin(clinicSlug);

  return (
    <div className={styles.page}>
      <Logo height={28} className={styles.logo} />

      <PhoneOtpForm
        step={step}
        phone={phone}
        code={code}
        isSubmitting={isSubmitting}
        error={error}
        resendCooldown={resendCooldown}
        onPhoneChange={setPhone}
        onCodeChange={setCode}
        onSubmitPhone={requestCode}
        onSubmitCode={verifyCode}
        onChangePhone={changePhone}
        onResendCode={resendCode}
      />
    </div>
  );
};
