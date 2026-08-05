'use client';

import { Logo } from '@/components/icons/icons';
import { PhoneLinkForm } from '@/components/patient-portal/PhoneLinkForm/PhoneLinkForm';
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
    isSubmitting,
    error,
    resendCooldown,
    requestLink,
    changePhone,
    resendLink,
  } = usePortalLogin(clinicSlug);

  return (
    <div className={styles.page}>
      <Logo height={28} className={styles.logo} />

      <PhoneLinkForm
        step={step}
        phone={phone}
        isSubmitting={isSubmitting}
        error={error}
        resendCooldown={resendCooldown}
        onPhoneChange={setPhone}
        onSubmitPhone={requestLink}
        onChangePhone={changePhone}
        onResendLink={resendLink}
      />
    </div>
  );
};
