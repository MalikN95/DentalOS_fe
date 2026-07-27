'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type {
  ApiTreatmentPlan,
  TreatmentPlanItemDraft,
  TreatmentPlanStatus,
} from '@/common/types/treatment-plan';
import { TreatmentPlanItemRow } from '@/components/treatment-plans/TreatmentPlanItemRow/TreatmentPlanItemRow';
import { TreatmentPlanItemsEditor } from '@/components/treatment-plans/TreatmentPlanItemsEditor/TreatmentPlanItemsEditor';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { apiItemToDraft, draftToPayload } from '@/helpers/treatment-plan-items';
import { useDentalChart } from '@/hooks/useDentalChart';
import { useServiceOptions } from '@/hooks/useServiceOptions';
import { useTreatmentPlan } from '@/hooks/useTreatmentPlan';
import type { useTreatmentPlans } from '@/hooks/useTreatmentPlans';
import styles from './TreatmentPlanDetailModal.module.css';

// Item composition (add/remove/reorder) is only safe before work has started —
// replaceItems recreates every row from scratch and would wipe done/skipped
// progress already recorded on an approved/in-progress plan.
const COMPOSITION_STATUSES: TreatmentPlanStatus[] = ['draft', 'proposed'];

const STATUS_VALUES: TreatmentPlanStatus[] = [
  'draft',
  'proposed',
  'approved',
  'in_progress',
  'completed',
  'cancelled',
];

type TreatmentPlanDetailFormProps = {
  plan: ApiTreatmentPlan;
  services: ReturnType<typeof useServiceOptions>['services'];
  chart: ReturnType<typeof useDentalChart>['chart'];
  currency: string;
  canEdit: boolean;
  deleteMutation: ReturnType<typeof useTreatmentPlans>['deleteMutation'];
  updateMutation: ReturnType<typeof useTreatmentPlan>['updateMutation'];
  replaceItemsMutation: ReturnType<typeof useTreatmentPlan>['replaceItemsMutation'];
  updateItemStatusMutation: ReturnType<typeof useTreatmentPlan>['updateItemStatusMutation'];
  onClose: () => void;
  onDeleted?: () => void;
};

const TreatmentPlanDetailForm = ({
  plan,
  services,
  chart,
  currency,
  canEdit,
  deleteMutation,
  updateMutation,
  replaceItemsMutation,
  updateItemStatusMutation,
  onClose,
  onDeleted,
}: TreatmentPlanDetailFormProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const statusFieldId = useId();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [title, setTitle] = useState(plan.title);
  const [notes, setNotes] = useState(plan.notes ?? '');
  const [status, setStatus] = useState<TreatmentPlanStatus>(plan.status);
  const [items, setItems] = useState<TreatmentPlanItemDraft[]>(() =>
    plan.items.map(apiItemToDraft),
  );

  const isComposing = COMPOSITION_STATUSES.includes(status);

  const handleSaveDetails = () => {
    updateMutation.mutate({
      title: title.trim(),
      notes: notes.trim() || undefined,
      status,
    });
  };

  const handleSaveItems = () => {
    const validItems = items.filter((item) => item.serviceId);
    replaceItemsMutation.mutate({ items: validItems.map(draftToPayload) });
  };

  const handleDelete = () => {
    deleteMutation.mutate(plan.id, { onSuccess: onDeleted });
  };

  return (
    <Modal
      title={t.detailTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      onClose={onClose}
      footer={
        isConfirmingDelete ? (
          <>
            <Button
              type="button"
              variant="soft"
              color="gray"
              onClick={() => setIsConfirmingDelete(false)}
            >
              {dict.common.cancel}
            </Button>
            <Button
              type="button"
              color="danger"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? t.deleting : t.confirmDelete}
            </Button>
          </>
        ) : (
          <>
            {canEdit ? (
              <Button
                type="button"
                variant="soft"
                color="danger"
                onClick={() => setIsConfirmingDelete(true)}
              >
                {t.delete}
              </Button>
            ) : null}
            <Button type="button" variant="soft" color="gray" onClick={onClose}>
              {dict.common.close}
            </Button>
          </>
        )
      }
    >
      {updateMutation.error ? <Alert color="danger">{updateMutation.error.message}</Alert> : null}
      {replaceItemsMutation.error ? (
        <Alert color="danger">{replaceItemsMutation.error.message}</Alert>
      ) : null}
      {updateItemStatusMutation.error ? (
        <Alert color="danger">{updateItemStatusMutation.error.message}</Alert>
      ) : null}
      {deleteMutation.error ? <Alert color="danger">{deleteMutation.error.message}</Alert> : null}

      <div className={styles.fields}>
        <TextField
          label={t.titleLabel}
          value={title}
          disabled={!canEdit}
          onChange={(event) => setTitle(event.target.value)}
        />

        <div className={styles.field}>
          <label className={styles.label} htmlFor={statusFieldId}>
            {t.statusLabel}
          </label>
          <select
            id={statusFieldId}
            className={styles.select}
            value={status}
            disabled={!canEdit}
            onChange={(event) => setStatus(event.target.value as TreatmentPlanStatus)}
          >
            {STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {t.status[value]}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${statusFieldId}-notes`}>
            {t.notesLabel}
          </label>
          <textarea
            id={`${statusFieldId}-notes`}
            className={styles.textarea}
            value={notes}
            disabled={!canEdit}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        {canEdit ? (
          <div className={styles.actions}>
            <Button
              type="button"
              variant="soft"
              disabled={updateMutation.isPending}
              onClick={handleSaveDetails}
            >
              {updateMutation.isPending ? dict.common.saving : t.saveDetails}
            </Button>
          </div>
        ) : null}
      </div>

      <div className={styles.itemsSection}>
        <span className={styles.label}>{t.itemsLabel}</span>

        {isComposing ? (
          <>
            <TreatmentPlanItemsEditor
              items={items}
              services={services}
              chart={chart}
              disabled={!canEdit}
              onChange={setItems}
            />
            {canEdit ? (
              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="soft"
                  disabled={replaceItemsMutation.isPending}
                  onClick={handleSaveItems}
                >
                  {replaceItemsMutation.isPending ? dict.common.saving : t.saveItems}
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.itemsList}>
            {plan.items.length === 0 ? <p className={styles.state}>{t.itemsEmpty}</p> : null}
            {plan.items.map((item) => (
              <TreatmentPlanItemRow
                key={item.id}
                item={item}
                currency={currency}
                disabled={!canEdit}
                allowSkip
                onSetStatus={(nextStatus) =>
                  updateItemStatusMutation.mutate({ itemId: item.id, status: nextStatus })
                }
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

type TreatmentPlanDetailModalProps = {
  planId: string;
  currency: string;
  canEdit: boolean;
  deleteMutation: ReturnType<typeof useTreatmentPlans>['deleteMutation'];
  onClose: () => void;
  onDeleted?: () => void;
};

export const TreatmentPlanDetailModal = ({
  planId,
  currency,
  canEdit,
  deleteMutation,
  onClose,
  onDeleted,
}: TreatmentPlanDetailModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const { plan, isLoading, errorMessage, updateMutation, replaceItemsMutation, updateItemStatusMutation } =
    useTreatmentPlan(planId);
  const { chart } = useDentalChart(plan?.patientId ?? '');
  const { services } = useServiceOptions();

  if (isLoading || !plan) {
    return (
      <Modal title={t.detailTitle} closeLabel={dict.common.close} onClose={onClose}>
        {errorMessage ? (
          <Alert color="danger">{errorMessage}</Alert>
        ) : (
          <span className={styles.state}>{dict.common.loading}</span>
        )}
      </Modal>
    );
  }

  return (
    // Keyed on the loaded plan's id so the form below always mounts fresh with
    // its local draft state seeded from that exact plan — no effect needed to
    // resync state after the async fetch resolves.
    <TreatmentPlanDetailForm
      key={plan.id}
      plan={plan}
      services={services}
      chart={chart}
      currency={currency}
      canEdit={canEdit}
      deleteMutation={deleteMutation}
      updateMutation={updateMutation}
      replaceItemsMutation={replaceItemsMutation}
      updateItemStatusMutation={updateItemStatusMutation}
      onClose={onClose}
      onDeleted={onDeleted}
    />
  );
};
