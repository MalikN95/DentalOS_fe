'use client';

import { BranchesSection } from '@/components/settings/BranchesSection/BranchesSection';
import { ClinicSettingsForm } from '@/components/settings/ClinicSettingsForm/ClinicSettingsForm';
import styles from './page.module.css';

export const SettingsPageContent = () => (
  <div className={styles.page}>
    <div>
      <h1 className={styles.pageTitle}>Настройки</h1>
      <p className={styles.pageDescription}>Параметры клиники и управление филиалами.</p>
    </div>

    <div className={styles.sections}>
      <ClinicSettingsForm />
      <BranchesSection />
    </div>
  </div>
);
