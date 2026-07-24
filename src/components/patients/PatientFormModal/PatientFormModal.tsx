'use client';

import { useId } from 'react';
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
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
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
        <TextField
          label={t.firstName}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <TextField label={t.lastName} error={errors.lastName?.message} {...register('lastName')} />
        <TextField
          label={t.phone}
          placeholder="+79001234567"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <TextField
          label={t.email}
          type="email"
          placeholder="patient@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label={t.birthDate}
          type="date"
          error={errors.birthDate?.message}
          {...register('birthDate')}
        />
        <label className={styles.field} htmlFor={genderFieldId}>
          <span className={styles.label}>{t.gender}</span>
          <select id={genderFieldId} className={styles.select} {...register('gender')}>
            <option value="">{dict.gender.notSet}</option>
            <option value="male">{dict.gender.male}</option>
            <option value="female">{dict.gender.female}</option>
            <option value="other">{dict.gender.other}</option>
          </select>
        </label>
      </div>

      <TextField
        label={t.allergies}
        placeholder={t.allergiesPlaceholder}
        {...register('allergies')}
      />
      <TextField
        label={t.chronic}
        placeholder={t.chronicPlaceholder}
        {...register('chronicDiseases')}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{t.insurance}</legend>
        <div className={styles.grid}>
          <TextField label={t.company} {...register('insuranceCompany')} />
          <TextField label={t.policy} {...register('insurancePolicyNumber')} />
          <TextField label={t.validUntil} type="date" {...register('insuranceValidUntil')} />
        </div>
      </fieldset>

      <label className={styles.field} htmlFor={commentsFieldId}>
        <span className={styles.label}>{t.comment}</span>
        <textarea
          id={commentsFieldId}
          className={styles.textarea}
          placeholder={t.commentPlaceholder}
          {...register('comments')}
        />
      </label>

      {isEditMode ? (
        <SwitchToggle checked={watch('isActive')} label={t.active} onChange={handleActiveChange} />
      ) : null}
    </Modal>
  );
};
