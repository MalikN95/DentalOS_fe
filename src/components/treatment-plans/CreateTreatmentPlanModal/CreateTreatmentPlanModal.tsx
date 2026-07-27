'use client';

import { useId, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { StaffRole } from '@/common/types/staff';
import type { TreatmentPlanItemDraft } from '@/common/types/treatment-plan';
import { TreatmentPlanItemsEditor } from '@/components/treatment-plans/TreatmentPlanItemsEditor/TreatmentPlanItemsEditor';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { createEmptyTreatmentPlanItemDraft, draftToPayload } from '@/helpers/treatment-plan-items';
import { useCreateTreatmentPlanForm } from '@/hooks/useCreateTreatmentPlanForm';
import { useDentalChart } from '@/hooks/useDentalChart';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './CreateTreatmentPlanModal.module.css';

const DOCTOR_SELECT_HIDDEN_FOR: StaffRole[] = ['doctor'];

type CreateTreatmentPlanModalProps = {
  /** Pre-selects the patient, e.g. when opened from an already-filtered list. */
  initialPatientId?: string;
  /** Pre-fills the first item's tooth, e.g. when opened from the dental chart. */
  initialToothNumber?: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateTreatmentPlanModal = ({
  initialPatientId,
  initialToothNumber,
  onClose,
  onSuccess,
}: CreateTreatmentPlanModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const patientFieldId = useId();
  const doctorFieldId = useId();
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const needsDoctorSelect = !DOCTOR_SELECT_HIDDEN_FOR.includes(currentUser.role as StaffRole);

  const { patients } = usePatientOptions();
  const [items, setItems] = useState<TreatmentPlanItemDraft[]>(() => [
    { ...createEmptyTreatmentPlanItemDraft(), toothNumber: initialToothNumber ?? null },
  ]);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const { form, optionsQuery, mutation } = useCreateTreatmentPlanForm({
    initialPatientId,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const selectedPatientId = useWatch({ control, name: 'patientId' });
  const { chart } = useDentalChart(selectedPatientId);

  const services = optionsQuery.data?.services ?? [];
  const doctors = optionsQuery.data?.doctors ?? [];
  const isOptionsLoading = optionsQuery.isLoading;
  const optionsError = optionsQuery.error?.message ?? null;
  const submitError = mutation.error?.message ?? null;

  const handleFormSubmit = handleSubmit((values) => {
    const validItems = items.filter((item) => item.serviceId);

    if (validItems.length === 0) {
      setItemsError(t.itemsRequired);
      return;
    }

    setItemsError(null);
    mutation.mutate({ values, items: validItems.map(draftToPayload) });
  });

  return (
    <Modal
      title={t.createTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting || isOptionsLoading}>
            {isSubmitting ? dict.common.saving : t.create}
          </Button>
        </>
      }
    >
      {optionsError ? <Alert color="danger">{optionsError}</Alert> : null}
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      {isOptionsLoading ? <span className={styles.state}>{t.loadingOptions}</span> : null}

      {!isOptionsLoading ? (
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={patientFieldId}>
              {t.patientLabel}
            </label>
            <select
              id={patientFieldId}
              className={styles.select}
              {...register('patientId')}
            >
              <option value="">{t.selectPatientPlaceholder}</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.lastName} {patient.firstName}
                  {patient.phone ? ` · ${patient.phone}` : ''}
                </option>
              ))}
            </select>
            {errors.patientId ? (
              <span className={styles.errorText}>{errors.patientId.message}</span>
            ) : null}
          </div>

          <TextField
            label={t.titleLabel}
            placeholder={t.titlePlaceholder}
            error={errors.title?.message}
            {...register('title')}
          />

          {needsDoctorSelect ? (
            <div className={styles.field}>
              <label className={styles.label} htmlFor={doctorFieldId}>
                {t.doctorLabel}
              </label>
              <select
                id={doctorFieldId}
                className={styles.select}
                {...register('doctorProfileId')}
              >
                <option value="">{t.selectDoctor}</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.user.firstName} {doctor.user.lastName}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={styles.field}>
            <label className={styles.label} htmlFor={`${doctorFieldId}-notes`}>
              {t.notesLabel}
            </label>
            <textarea
              id={`${doctorFieldId}-notes`}
              className={styles.textarea}
              placeholder={t.notesPlaceholder}
              {...register('notes')}
            />
          </div>

          <div className={styles.field}>
            <span className={styles.label}>{t.itemsLabel}</span>
            <TreatmentPlanItemsEditor
              items={items}
              services={services}
              chart={chart}
              onChange={(next) => {
                setItems(next);
                setItemsError(null);
              }}
            />
            {itemsError ? <span className={styles.errorText}>{itemsError}</span> : null}
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
