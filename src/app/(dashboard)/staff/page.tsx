'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { StaffIcon } from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';

const StaffPage = () => {
  const { t } = useTranslation();

  return (
    <EmptyState
      icon={<StaffIcon size={28} />}
      title={t.placeholders.staffTitle}
      description={t.placeholders.staffDesc}
    />
  );
};

export default StaffPage;
