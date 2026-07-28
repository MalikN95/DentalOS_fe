'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { StaffRole } from '@/common/types/staff';
import { FileTextIcon } from '@/components/icons/icons';
import { Button } from '@/components/ui';
import { CreateTreatmentPlanModal } from '@/components/treatment-plans/CreateTreatmentPlanModal/CreateTreatmentPlanModal';
import { TreatmentPlanCard } from '@/components/treatment-plans/TreatmentPlanCard/TreatmentPlanCard';
import { TreatmentPlanDetailModal } from '@/components/treatment-plans/TreatmentPlanDetailModal/TreatmentPlanDetailModal';
import { useTreatmentPlans } from '@/hooks/useTreatmentPlans';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './PatientTreatmentPlans.module.css';

const EDIT_ROLES: StaffRole[] = ['owner', 'admin', 'doctor'];
const PREVIEW_LIMIT = 5;

type PatientTreatmentPlansProps = {
  patientId: string;
  currency: string;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientTreatmentPlans = ({
  patientId,
  currency,
  className,
  style,
}: PatientTreatmentPlansProps) => {
  const { t } = useTranslation();
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canEdit = EDIT_ROLES.includes(currentUser.role as StaffRole);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  const { plans, isLoading, deleteMutation } = useTreatmentPlans({ patientId });
  const plansPreview = plans.slice(0, PREVIEW_LIMIT);

  return (
    <section className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <FileTextIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.treatmentPlans.title}</h2>
        {canEdit ? (
          <Button variant="soft" className={styles.addButton} onClick={() => setIsCreateOpen(true)}>
            {t.treatmentPlans.newPlan}
          </Button>
        ) : null}
      </div>

      {isLoading ? <span className={styles.state}>{t.treatmentPlans.loading}</span> : null}
      {!isLoading && plansPreview.length === 0 ? (
        <span className={styles.state}>{t.treatmentPlans.emptyTitle}</span>
      ) : null}
      {!isLoading && plansPreview.length > 0 ? (
        <div className={styles.list}>
          {plansPreview.map((plan) => (
            <TreatmentPlanCard
              key={plan.id}
              plan={plan}
              currency={currency}
              showPatientName={false}
              onClick={() => setOpenPlanId(plan.id)}
            />
          ))}
        </div>
      ) : null}

      {isCreateOpen ? (
        <CreateTreatmentPlanModal
          initialPatientId={patientId}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {openPlanId ? (
        <TreatmentPlanDetailModal
          planId={openPlanId}
          currency={currency}
          canEdit={canEdit}
          deleteMutation={deleteMutation}
          onClose={() => setOpenPlanId(null)}
          onDeleted={() => setOpenPlanId(null)}
        />
      ) : null}
    </section>
  );
};
