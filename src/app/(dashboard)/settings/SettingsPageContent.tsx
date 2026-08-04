'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { BranchesSection } from '@/components/settings/BranchesSection/BranchesSection';
import { ClinicSettingsForm } from '@/components/settings/ClinicSettingsForm/ClinicSettingsForm';
import { EmailTemplatesSection } from '@/components/settings/EmailTemplatesSection/EmailTemplatesSection';
import { ServicesSection } from '@/components/settings/ServicesSection/ServicesSection';
import { StatisticsSection } from '@/components/settings/StatisticsSection/StatisticsSection';
import { Tabs } from '@/components/ui';
import styles from './page.module.css';

const SETTINGS_TABS = ['clinic', 'branches', 'services', 'emailTemplates', 'statistics'] as const;

type SettingsTab = (typeof SETTINGS_TABS)[number];

export const SettingsPageContent = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('clinic');

  const tabItems = [
    { id: 'clinic', label: t.settings.clinicTitle },
    { id: 'branches', label: t.branches.title },
    { id: 'services', label: t.services.title },
    { id: 'emailTemplates', label: t.emailTemplates.title },
    { id: 'statistics', label: t.settings.statisticsTitle },
  ];

  const handleTabChange = (id: string) => {
    if ((SETTINGS_TABS as readonly string[]).includes(id)) {
      setActiveTab(id as SettingsTab);
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>{t.settings.pageTitle}</h1>
        <p className={styles.pageDescription}>{t.settings.pageDescription}</p>
      </div>

      <Tabs items={tabItems} activeId={activeTab} onChange={handleTabChange} />

      <div className={styles.sections}>
        {activeTab === 'clinic' ? <ClinicSettingsForm /> : null}
        {activeTab === 'branches' ? <BranchesSection /> : null}
        {activeTab === 'services' ? <ServicesSection /> : null}
        {activeTab === 'emailTemplates' ? <EmailTemplatesSection /> : null}
        {activeTab === 'statistics' ? <StatisticsSection /> : null}
      </div>
    </div>
  );
};
