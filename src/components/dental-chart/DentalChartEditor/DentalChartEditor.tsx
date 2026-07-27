'use client';

import { useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiToothState, ToothCondition } from '@/common/types/dental-chart';
import { ToothChart } from '@/components/dental-chart/ToothChart/ToothChart';
import { ToothFilesSection } from '@/components/dental-chart/ToothFilesSection/ToothFilesSection';
import { Badge } from '@/components/ui';
import { CreateTreatmentPlanModal } from '@/components/treatment-plans/CreateTreatmentPlanModal/CreateTreatmentPlanModal';
import { formatMoney } from '@/helpers/appointment-status';
import { treatmentPlanItemStatusColor } from '@/helpers/treatment-plan-status';
import { useTreatmentPlans } from '@/hooks/useTreatmentPlans';
import styles from './DentalChartEditor.module.css';

const CONDITIONS: ToothCondition[] = [
  'healthy',
  'caries',
  'filling',
  'crown',
  'implant',
  'extracted',
  'other',
];

const CONDITION_BUTTON_CLASS: Record<ToothCondition, string> = {
  healthy: styles.healthy,
  caries: styles.caries,
  filling: styles.filling,
  crown: styles.crown,
  implant: styles.implant,
  extracted: styles.extracted,
  other: styles.other,
};

type DentalChartEditorProps = {
  patientId: string;
  currency: string;
  chart: ApiToothState[];
  canEdit: boolean;
  isSaving: boolean;
  onSave: (toothNumber: number, condition: ToothCondition) => void;
};

export const DentalChartEditor = ({
  patientId,
  currency,
  chart,
  canEdit,
  isSaving,
  onSave,
}: DentalChartEditorProps) => {
  const { t: dict } = useTranslation();
  const t = dict.dentalChart;
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const { plans } = useTreatmentPlans({ patientId });

  const selectedState = chart.find((state) => state.toothNumber === selectedTooth) ?? null;
  const allItems = plans.flatMap((plan) =>
    plan.items.map((item) => ({ item, planTitle: plan.title })),
  );
  const toothItems = selectedTooth
    ? allItems.filter(({ item }) => item.toothNumber === selectedTooth)
    : allItems;

  const handleSelectTooth = (toothNumber: number) => {
    setSelectedTooth((current) => (current === toothNumber ? null : toothNumber));
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartColumn}>
        <ToothChart size="lg" value={selectedTooth} chart={chart} onSelect={handleSelectTooth} />

        {selectedTooth ? (
          <span className={styles.toothLabel}>
            {format(dict.treatmentPlans.toothNumberLabel, { number: selectedTooth })}
          </span>
        ) : (
          <span className={styles.toothLabel}>{t.allTeethTitle}</span>
        )}

        {selectedTooth && !canEdit ? <p className={styles.forbidden}>{t.forbidden}</p> : null}

        {selectedTooth ? (
          <div className={styles.conditionButtons}>
            {CONDITIONS.map((condition) => (
              <button
                key={condition}
                type="button"
                disabled={!canEdit || isSaving}
                title={t.condition[condition]}
                aria-label={t.condition[condition]}
                className={`${styles.conditionButton} ${CONDITION_BUTTON_CLASS[condition]} ${
                  selectedState?.condition === condition ? styles.conditionButtonActive : ''
                }`}
                onClick={() => onSave(selectedTooth, condition)}
              >
                {t.condition[condition].slice(0, 2).toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.hint}>{t.selectToothHint}</p>
        )}
      </div>

      <div className={styles.planColumn}>
        <div className={styles.planHeader}>
          <span className={styles.planHeading}>{t.planTitle}</span>
          {canEdit ? (
            <button
              type="button"
              className={styles.planAddButton}
              onClick={() => setIsPlanModalOpen(true)}
            >
              {t.planAdd}
            </button>
          ) : null}
        </div>

        {toothItems.length === 0 ? (
          <p className={styles.planEmptyHint}>
            {selectedTooth ? t.planEmptyForTooth : t.planEmptyAll}
          </p>
        ) : (
          <ul className={styles.planList}>
            {toothItems.map(({ item, planTitle }) => (
              <li key={item.id} className={styles.planItem}>
                <div className={styles.planItemTop}>
                  <span className={styles.planItemService}>
                    {item.service?.name ?? dict.treatmentPlans.unknownService}
                  </span>
                  <span className={styles.planItemPrice}>{formatMoney(item.price, currency)}</span>
                </div>
                <div className={styles.planItemBottom}>
                  <span className={styles.planItemMeta}>
                    {planTitle} ·{' '}
                    {item.toothNumber
                      ? format(dict.treatmentPlans.toothNumberLabel, { number: item.toothNumber })
                      : dict.treatmentPlans.noTooth}
                  </span>
                  <Badge color={treatmentPlanItemStatusColor[item.status]}>
                    {dict.treatmentPlans.itemStatus[item.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ToothFilesSection
        className={styles.filesColumn}
        patientId={patientId}
        toothNumber={selectedTooth}
        canEdit={canEdit}
      />

      {isPlanModalOpen ? (
        <CreateTreatmentPlanModal
          initialPatientId={patientId}
          initialToothNumber={selectedTooth ?? undefined}
          onClose={() => setIsPlanModalOpen(false)}
          onSuccess={() => setIsPlanModalOpen(false)}
        />
      ) : null}
    </div>
  );
};
