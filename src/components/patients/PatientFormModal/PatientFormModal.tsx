'use client';

import { useId } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient } from '@/common/types/patient';
import { Alert, Button, Modal, SwitchToggle, TextField } from '@/components/ui';
import { usePatientForm } from '@/hooks/usePatientForm';
import styles from './PatientFormModal.module.css';

type PatientFormModalProps = {
  patient?: Patient | null;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientFormModal = ({
  patient,
  onClose,
  onSuccess,
  className,
  style,
}: PatientFormModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.patients.form;
  const genderFieldId = useId();
  const commentsFieldId = useId();

  const { form, mutation, isEditMode } = usePatientForm({
    patient,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const handleActiveChange = (checked: boolean) => {
    setValue('isActive', checked);
  };

  const submitError = mutation.error?.message ?? null;
  const title = isEditMode ? t.editTitle : t.createTitle;
  const submitIdleLabel = isEditMode ? t.save : t.create;

  return (
    <Modal
      title={title}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.settings.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? dict.common.saving : submitIdleLabel}
          </Button>
        </>
      }
    >
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      <div className={styles.grid}>
        <Controller
          control={control}
          name="firstName"
          render={({ field, fieldState }) => (
            <TextField
              label={t.firstName}
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field, fieldState }) => (
            <TextField
              label={t.lastName}
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              label={t.phone}
              placeholder="+79001234567"
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField
              label={t.email}
              type="email"
              placeholder="patient@example.com"
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="birthDate"
          render={({ field, fieldState }) => (
            <TextField
              label={t.birthDate}
              type="date"
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <label className={styles.field} htmlFor={genderFieldId}>
          <span className={styles.label}>{t.gender}</span>
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <select
                id={genderFieldId}
                className={styles.select}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">{dict.gender.notSet}</option>
                <option value="male">{dict.gender.male}</option>
                <option value="female">{dict.gender.female}</option>
                <option value="other">{dict.gender.other}</option>
              </select>
            )}
          />
        </label>
      </div>

      <Controller
        control={control}
        name="allergies"
        render={({ field }) => (
          <TextField
            label={t.allergies}
            placeholder={t.allergiesPlaceholder}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="chronicDiseases"
        render={({ field }) => (
          <TextField
            label={t.chronic}
            placeholder={t.chronicPlaceholder}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{t.insurance}</legend>
        <div className={styles.grid}>
          <Controller
            control={control}
            name="insuranceCompany"
            render={({ field }) => (
              <TextField
                label={t.company}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="insurancePolicyNumber"
            render={({ field }) => (
              <TextField
                label={t.policy}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Controller
            control={control}
            name="insuranceValidUntil"
            render={({ field }) => (
              <TextField
                label={t.validUntil}
                type="date"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </div>
      </fieldset>

      <label className={styles.field} htmlFor={commentsFieldId}>
        <span className={styles.label}>{t.comment}</span>
        <Controller
          control={control}
          name="comments"
          render={({ field }) => (
            <textarea
              id={commentsFieldId}
              className={styles.textarea}
              placeholder={t.commentPlaceholder}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </label>

      {isEditMode ? (
        <SwitchToggle checked={watch('isActive')} label={t.active} onChange={handleActiveChange} />
      ) : null}
    </Modal>
  );
};
