'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiTreatmentPlanItem, TreatmentPlanItemStatus } from '@/common/types/treatment-plan';
import { Badge, Checkbox } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { treatmentPlanItemStatusColor } from '@/helpers/treatment-plan-status';
import styles from './TreatmentPlanItemRow.module.css';

type TreatmentPlanItemRowProps = {
  item: ApiTreatmentPlanItem;
  currency: string;
  /** Extra context line, e.g. the parent plan's title in a flattened checklist. */
  subtitle?: string;
  disabled?: boolean;
  /** Lets the row also mark an item as deliberately skipped, not just done. */
  allowSkip?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSetStatus: (status: TreatmentPlanItemStatus) => void;
};

export const TreatmentPlanItemRow = ({
  item,
  currency,
  subtitle,
  disabled = false,
  allowSkip = false,
  className,
  style,
  onSetStatus,
}: TreatmentPlanItemRowProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const isDone = item.status === 'done';
  const isSkipped = item.status === 'skipped';

  return (
    <div className={`${styles.row} ${className ?? ''}`} style={style}>
      <Checkbox
        checked={isDone}
        disabled={disabled || isSkipped}
        onChange={(checked) => onSetStatus(checked ? 'done' : 'planned')}
      />

      <div className={styles.info}>
        <span className={styles.service}>{item.service?.name ?? t.unknownService}</span>
        <span className={styles.meta}>
          {subtitle ? `${subtitle} · ` : ''}
          {item.toothNumber ? format(t.toothNumberLabel, { number: item.toothNumber }) : t.noTooth}
        </span>
      </div>

      <span className={styles.price}>{formatMoney(item.price, currency)}</span>

      <Badge color={treatmentPlanItemStatusColor[item.status]}>{t.itemStatus[item.status]}</Badge>

      {allowSkip && !isDone ? (
        <button
          type="button"
          className={styles.skipButton}
          disabled={disabled}
          onClick={() => onSetStatus(isSkipped ? 'planned' : 'skipped')}
        >
          {isSkipped ? t.unskipItem : t.skipItem}
        </button>
      ) : null}
    </div>
  );
};
