'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { BranchesSection } from '@/components/settings/BranchesSection/BranchesSection';
import { ClinicSettingsForm } from '@/components/settings/ClinicSettingsForm/ClinicSettingsForm';
import styles from './page.module.css';

export const SettingsPageContent = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>{t.settings.pageTitle}</h1>
        <p className={styles.pageDescription}>{t.settings.pageDescription}</p>
      </div>

      <div className={styles.sections}>
        <ClinicSettingsForm />
        <BranchesSection />
      </div>
    </div>
  );
};
