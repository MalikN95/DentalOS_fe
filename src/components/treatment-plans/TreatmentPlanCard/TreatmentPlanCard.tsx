'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiTreatmentPlan } from '@/common/types/treatment-plan';
import { Badge } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { formatDate } from '@/helpers/date';
import { treatmentPlanStatusColor } from '@/helpers/treatment-plan-status';
import styles from './TreatmentPlanCard.module.css';

type TreatmentPlanCardProps = {
  plan: ApiTreatmentPlan;
  currency: string;
  /** Hide the patient name, e.g. inside a single patient's own profile. */
  showPatientName?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export const TreatmentPlanCard = ({
  plan,
  currency,
  showPatientName = true,
  className,
  style,
  onClick,
}: TreatmentPlanCardProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const doneCount = plan.items.filter((item) => item.status === 'done').length;
  const total = plan.items.reduce((sum, item) => sum + Number(item.price), 0);
  const patientName = `${plan.patient.lastName} ${plan.patient.firstName}`.trim();
  const doctorName =
    `${plan.doctorProfile.user.firstName} ${plan.doctorProfile.user.lastName}`.trim();

  return (
    <button
      type="button"
      className={`${styles.card} ${className ?? ''}`}
      style={style}
      onClick={onClick}
    >
      <div className={styles.header}>
        <div className={styles.titles}>
          {showPatientName ? (
            <span className={styles.patientName}>{patientName || dict.common.dash}</span>
          ) : null}
          <span className={styles.title}>{plan.title}</span>
        </div>
        <Badge color={treatmentPlanStatusColor[plan.status]}>{t.status[plan.status]}</Badge>
      </div>

      <div className={styles.meta}>
        <span>{doctorName || dict.common.dash}</span>
        <span>{formatDate(plan.createdAt)}</span>
      </div>

      <div className={styles.footer}>
        <span className={styles.progress}>
          {format(t.progressLabel, { done: doneCount, total: plan.items.length })}
        </span>
        <span className={styles.total}>{formatMoney(String(total), currency)}</span>
      </div>
    </button>
  );
};
