'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { TreatmentPlanItemRow } from '@/components/treatment-plans/TreatmentPlanItemRow/TreatmentPlanItemRow';
import { Alert } from '@/components/ui';
import { useAppointmentTreatmentChecklist } from '@/hooks/useAppointmentTreatmentChecklist';
import { useClinic } from '@/hooks/useClinic';
import styles from './AppointmentTreatmentSection.module.css';

type AppointmentTreatmentSectionProps = {
  patientId: string;
  canEdit: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const AppointmentTreatmentSection = ({
  patientId,
  canEdit,
  className,
  style,
}: AppointmentTreatmentSectionProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  const { items, isLoading, errorMessage, mutation } = useAppointmentTreatmentChecklist(patientId);
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  return (
    <div className={className} style={style}>
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {mutation.error ? <Alert color="danger">{mutation.error.message}</Alert> : null}

      {isLoading ? <p className={styles.state}>{dict.common.loading}</p> : null}

      {!isLoading && items.length === 0 ? <p className={styles.state}>{t.planEmpty}</p> : null}

      {!isLoading && items.length > 0 ? (
        <div className={styles.list}>
          {items.map((item) => (
            <TreatmentPlanItemRow
              key={item.id}
              item={item}
              currency={currency}
              subtitle={item.planTitle}
              disabled={!canEdit || mutation.isPending}
              onSetStatus={(status) => mutation.mutate({ itemId: item.id, status })}
            />
          ))}
        </div>
      ) : null}

      {!canEdit ? <p className={styles.state}>{t.planForbidden}</p> : null}
    </div>
  );
};
