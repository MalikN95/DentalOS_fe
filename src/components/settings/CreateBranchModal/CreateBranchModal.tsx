'use client';

import type { UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { BranchSettings, WorkingHours } from '@/common/types/settings';
import type { CreateBranchFormValues } from '@/hooks/useBranchSettings';
import { Alert, Button, Modal, SwitchToggle, TextField } from '@/components/ui';
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
  const { t: dict } = useTranslation();
  const t = dict.branches;
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
    <Modal
      title={t.modalTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={handleCloseClick}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={handleCloseClick}>
            {dict.settings.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? dict.common.saving : t.submit}
          </Button>
        </>
      }
    >
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      <div className={styles.grid}>
        <TextField label={t.name} error={errors.name?.message} {...register('name')} />
        <TextField label={t.phone} error={errors.phone?.message} {...register('phone')} />
        <TextField
          label={t.address}
          className={styles.gridFull}
          error={errors.address?.message}
          {...register('address')}
        />
        <TextField
          label={t.latitude}
          placeholder="55.7558"
          error={errors.latitude?.message}
          {...register('latitude')}
        />
        <TextField
          label={t.longitude}
          placeholder="37.6173"
          error={errors.longitude?.message}
          {...register('longitude')}
        />
        <div className={styles.gridFull}>
          <SwitchToggle checked={isActive} label={t.active} onChange={handleActiveChange} />
        </div>
        <div className={styles.gridFull}>
          <SwitchToggle
            checked={useCustomHours}
            label={t.customHours}
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
    </Modal>
  );
};
