'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import type { BranchSettings, WorkingHours } from '@/common/types/settings';
import type { CreateBranchFormValues } from '@/hooks/useBranchSettings';
import { Alert, Button, SwitchToggle, TextField } from '@/components/ui';
import { WorkingHoursEditor } from '@/components/settings/WorkingHoursEditor/WorkingHoursEditor';
import styles from './CreateBranchModal.module.css';

type CreateBranchModalProps = {
  onClose: () => void;
  createForm: UseFormReturn<CreateBranchFormValues>;
  createMutation: UseMutationResult<BranchSettings, Error, CreateBranchFormValues>;
  onCreateSubmit: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const CreateBranchModal = ({
  onClose,
  createForm,
  createMutation,
  onCreateSubmit,
  className,
  style,
}: CreateBranchModalProps) => {
  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = createForm;

  const useCustomHours = watch('useCustomHours');
  const isActive = watch('isActive');
  const workingHours = watch('workingHours');
  const submitError = createMutation.error?.message ?? null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreateSubmit();
  };

  const handleCustomHoursChange = (checked: boolean) => {
    setValue('useCustomHours', checked, { shouldDirty: true });
  };

  const handleActiveChange = (checked: boolean) => {
    setValue('isActive', checked, { shouldDirty: true });
  };

  const handleWorkingHoursChange = (value: WorkingHours) => {
    setValue('workingHours', value, { shouldDirty: true });
  };

  return (
    <div
      className={`${styles.overlay} ${className ?? ''}`}
      style={style}
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-branch-title"
      >
        <div className={styles.header}>
          <span id="create-branch-title" className={styles.title}>
            Новый филиал
          </span>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Закрыть"
            onClick={handleCloseClick}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className={styles.body}>
            {submitError ? <Alert color="danger">{submitError}</Alert> : null}

            <div className={styles.grid}>
              <TextField label="Название" error={errors.name?.message} {...register('name')} />
              <TextField label="Телефон" error={errors.phone?.message} {...register('phone')} />
              <TextField
                label="Адрес"
                className={styles.gridFull}
                error={errors.address?.message}
                {...register('address')}
              />
              <TextField
                label="Широта"
                placeholder="55.7558"
                error={errors.latitude?.message}
                {...register('latitude')}
              />
              <TextField
                label="Долгота"
                placeholder="37.6173"
                error={errors.longitude?.message}
                {...register('longitude')}
              />
              <div className={styles.gridFull}>
                <SwitchToggle
                  checked={isActive}
                  label="Филиал активен"
                  onChange={handleActiveChange}
                />
              </div>
              <div className={styles.gridFull}>
                <SwitchToggle
                  checked={useCustomHours}
                  label="Своё расписание (иначе — часы клиники)"
                  onChange={handleCustomHoursChange}
                />
              </div>
              {useCustomHours ? (
                <div className={styles.gridFull}>
                  <WorkingHoursEditor
                    value={workingHours}
                    onChange={handleWorkingHoursChange}
                    disabled={isSubmitting}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.footer}>
            <Button type="button" variant="soft" color="gray" onClick={handleCloseClick}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем...' : 'Добавить филиал'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
