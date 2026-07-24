'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { ToothIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const TreatmentPlansPage = () => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<ToothIcon size={28} />}
      title={t.placeholders.treatmentPlansTitle}
      description={t.placeholders.treatmentPlansDesc}
    />
  );
};

export default TreatmentPlansPage;
