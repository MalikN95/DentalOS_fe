'use client';

import { useId } from 'react';
import { useWatch } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiService } from '@/common/types/service';
import { Alert, Button, Modal, SwitchToggle, TextField } from '@/components/ui';
import { useServiceCategoryOptions } from '@/hooks/useServiceCategoryOptions';
import { useServiceForm } from '@/hooks/useServiceForm';
import styles from './ServiceEditorModal.module.css';

type ServiceEditorModalProps = {
  service?: ApiService | null;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const ServiceEditorModal = ({
  service,
  onClose,
  onSuccess,
  className,
  style,
}: ServiceEditorModalProps) => {
  'use no memo';

  const { t: dict } = useTranslation();
  const t = dict.services;
  const categoryFieldId = useId();
  const descriptionFieldId = useId();
  const preparationFieldId = useId();
  const { categories } = useServiceCategoryOptions();

  const { form, mutation, isEditMode } = useServiceForm({
    service,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const isActive = useWatch({ control, name: 'isActive' });
  const acceptsOnlineBooking = useWatch({ control, name: 'acceptsOnlineBooking' });

  const submitError = mutation.error?.message ?? null;
  const submitIdleLabel = isEditMode ? t.save : t.create;

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Modal
      title={isEditMode ? t.modalTitleEdit : t.modalTitleCreate}
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
        <TextField label={t.name} error={errors.name?.message} {...register('name')} />

        <label className={styles.field} htmlFor={categoryFieldId}>
          <span className={styles.label}>{t.category}</span>
          <select id={categoryFieldId} className={styles.select} {...register('categoryId')}>
            <option value="">{t.categoryNotSet}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <TextField
          label={t.price}
          placeholder="1500.00"
          error={errors.price?.message}
          {...register('price')}
        />
        <TextField
          label={t.durationMinutes}
          inputMode="numeric"
          placeholder="60"
          error={errors.durationMinutes?.message}
          {...register('durationMinutes')}
        />
      </div>

      <label className={styles.field} htmlFor={descriptionFieldId}>
        <span className={styles.label}>{t.descriptionLabel}</span>
        <textarea
          id={descriptionFieldId}
          className={styles.textarea}
          placeholder={t.descriptionPlaceholder}
          {...register('description')}
        />
      </label>

      <label className={styles.field} htmlFor={preparationFieldId}>
        <span className={styles.label}>{t.preparation}</span>
        <textarea
          id={preparationFieldId}
          className={styles.textarea}
          placeholder={t.preparationPlaceholder}
          {...register('preparation')}
        />
      </label>

      <SwitchToggle
        checked={isActive}
        label={t.active}
        onChange={(checked) => setValue('isActive', checked)}
      />

      <div className={styles.onlineBooking}>
        <SwitchToggle
          checked={acceptsOnlineBooking}
          label={t.acceptsOnlineBooking}
          onChange={(checked) => setValue('acceptsOnlineBooking', checked)}
        />
        <span className={styles.onlineBookingHint}>{t.acceptsOnlineBookingHint}</span>
      </div>
    </Modal>
  );
};
