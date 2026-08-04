'use client';

import { Controller } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PlatformClinicSummary } from '@/common/types/platform-admin';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { usePlatformClinicForm } from '@/hooks/usePlatformClinicForm';
import styles from './ClinicFormModal.module.css';

type ClinicFormModalProps = {
  clinic?: PlatformClinicSummary | null;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const ClinicFormModal = ({
  clinic,
  onClose,
  onSuccess,
  className,
  style,
}: ClinicFormModalProps) => {
  'use no memo';

  const { t: dict } = useTranslation();
  const t = dict.admin.form;

  const { form, mutation, isEditMode } = usePlatformClinicForm({
    clinic,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  const submitError = mutation.error?.message ?? null;
  const title = isEditMode ? t.editTitle : t.createTitle;
  const submitIdleLabel = isEditMode ? dict.settings.save : t.create;

  return (
    <Modal
      title={title}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      closeOnBackdrop={false}
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
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label={t.name}
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="slug"
          render={({ field, fieldState }) => (
            <TextField
              label={t.slug}
              placeholder="bright-smile"
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field }) => (
            <TextField
              label={t.address}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextField
              label={t.phone}
              placeholder="+79001234567"
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
              placeholder="info@clinic.com"
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="timezone"
          render={({ field }) => (
            <TextField
              label={t.timezone}
              placeholder="Asia/Almaty"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <TextField
              label={t.currency}
              placeholder="USD"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <TextField
              label={t.language}
              placeholder="en"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      {isEditMode ? null : (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t.adminSectionTitle}</legend>
          <div className={styles.grid}>
            <Controller
              control={control}
              name="adminFirstName"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.adminFirstName}
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="adminLastName"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.adminLastName}
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="adminEmail"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.adminEmail}
                  type="email"
                  placeholder="owner@clinic.com"
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="adminPhone"
              render={({ field }) => (
                <TextField
                  label={t.adminPhone}
                  placeholder="+79001234567"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="adminPassword"
              render={({ field, fieldState }) => (
                <TextField
                  label={t.adminPassword}
                  type="password"
                  hint={t.adminPasswordHint}
                  error={fieldState.error?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </div>
        </fieldset>
      )}
    </Modal>
  );
};
