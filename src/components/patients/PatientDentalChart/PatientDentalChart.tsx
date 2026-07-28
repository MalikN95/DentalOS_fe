'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { ToothCondition } from '@/common/types/dental-chart';
import type { StaffRole } from '@/common/types/staff';
import { DentalChartEditor } from '@/components/dental-chart/DentalChartEditor/DentalChartEditor';
import { ToothChart } from '@/components/dental-chart/ToothChart/ToothChart';
import { ExpandIcon, ToothIcon } from '@/components/icons/icons';
import { Modal } from '@/components/ui';
import { useDentalChart } from '@/hooks/useDentalChart';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './PatientDentalChart.module.css';

const EDIT_ROLES: StaffRole[] = ['owner', 'admin', 'doctor'];

type PatientDentalChartProps = {
  patientId: string;
  currency: string;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientDentalChart = ({
  patientId,
  currency,
  className,
  style,
}: PatientDentalChartProps) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canEdit = EDIT_ROLES.includes(currentUser.role as StaffRole);
  const { chart, isLoading, addMark } = useDentalChart(patientId);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleSave = (toothNumber: number, condition: ToothCondition) => {
    addMark.mutate({ toothNumber, condition });
  };

  return (
    <section className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.headingRow}>
        <span className={styles.headerIcon}>
          <ToothIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.dentalChart.title}</h2>
        <button
          type="button"
          className={styles.expandButton}
          title={t.dentalChart.expand}
          aria-label={t.dentalChart.expand}
          onClick={() => setIsEditorOpen(true)}
        >
          <ExpandIcon size={12} />
        </button>
      </div>

      <div className={styles.body}>
        {isLoading ? <span className={styles.state}>{t.dentalChart.loading}</span> : null}
        {!isLoading ? <ToothChart size="sm" chart={chart} /> : null}
      </div>

      {isEditorOpen ? (
        <Modal
          title={t.dentalChart.title}
          size="lg"
          closeLabel={t.common.close}
          scrollHintLabel={t.common.scrollForMore}
          onClose={() => setIsEditorOpen(false)}
        >
          <DentalChartEditor
            patientId={patientId}
            currency={currency}
            chart={chart}
            canEdit={canEdit}
            isSaving={addMark.isPending}
            onSave={handleSave}
          />
        </Modal>
      ) : null}
    </section>
  );
};
