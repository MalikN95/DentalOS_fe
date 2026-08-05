'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/icons';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Button } from '@/components/ui';
import { useMagicLogin } from '@/hooks/useMagicLogin';
import styles from './MagicLoginPageContent.module.css';

type MagicLoginPageContentProps = {
  clinicSlug: string;
  token: string | null;
};

export const MagicLoginPageContent = ({ clinicSlug, token }: MagicLoginPageContentProps) => {
  const { t } = useTranslation();
  const { status, error, login } = useMagicLogin(clinicSlug, token);

  const isVerifying = status === 'verifying';

  return (
    <div className={styles.page}>
      <Logo height={28} className={styles.logo} />

      <div className={styles.card}>
        <h1 className={styles.title}>{t.patientPortal.magicTitle}</h1>
        <p className={styles.subtitle}>{t.patientPortal.magicSubtitle}</p>

        {error ? <Alert color="danger">{error}</Alert> : null}

        <Button
          disabled={isVerifying || !token}
          className={styles.submitButton}
          onClick={login}
        >
          {isVerifying ? t.patientPortal.magicVerifying : t.patientPortal.magicButton}
        </Button>

        {status === 'error' ? (
          <Link href={`/portal/${clinicSlug}`} className={styles.backLink}>
            {t.patientPortal.magicBackToLogin}
          </Link>
        ) : null}
      </div>
    </div>
  );
};
