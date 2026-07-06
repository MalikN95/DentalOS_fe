'use client';

import { useRef } from 'react';
import type { WorkingHours } from '@/common/types/settings';
import { Alert, Button, SwitchToggle, TextField } from '@/components/ui';
import { WorkingHoursEditor } from '@/components/settings/WorkingHoursEditor/WorkingHoursEditor';
import { useClinicSettings } from '@/hooks/useClinicSettings';
import styles from './ClinicSettingsForm.module.css';

export const ClinicSettingsForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clinicQuery, form, updateMutation, logoMutation, onSubmit } = useClinicSettings();

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const workingHours = watch('workingHours');
  const isActive = watch('isActive');
  const clinic = clinicQuery.data;

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    logoMutation.mutate(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleWorkingHoursChange = (value: WorkingHours) => {
    setValue('workingHours', value, { shouldDirty: true });
  };

  const handleActiveChange = (checked: boolean) => {
    setValue('isActive', checked, { shouldDirty: true });
  };

  if (clinicQuery.isLoading) {
    return <div className={styles.section}>Загрузка настроек клиники...</div>;
  }

  if (clinicQuery.error) {
    return (
      <div className={styles.section}>
        <Alert color="danger">{clinicQuery.error.message}</Alert>
      </div>
    );
  }

  return (
    <section className={styles.section}>
      <div>
        <h2 className={styles.title}>Клиника</h2>
        <p className={styles.description}>
          Название и субдомен задаются при создании клиники и здесь не редактируются.
        </p>
      </div>

      {updateMutation.error ? <Alert color="danger">{updateMutation.error.message}</Alert> : null}
      {logoMutation.error ? <Alert color="danger">{logoMutation.error.message}</Alert> : null}

      <div className={styles.grid}>
        <div className={styles.readonlyRow}>
          <span className={styles.readonlyLabel}>Название</span>
          <span className={styles.readonlyValue}>{clinic?.name ?? '—'}</span>
        </div>
        <div className={styles.readonlyRow}>
          <span className={styles.readonlyLabel}>Субдомен</span>
          <span className={styles.readonlyValue}>{clinic?.subdomain ?? '—'}</span>
        </div>

        <div className={`${styles.logoRow} ${styles.gridFull}`}>
          <div className={styles.logoPreview}>
            {clinic?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL
              <img src={clinic.logoUrl} alt="Логотип клиники" className={styles.logoImage} />
            ) : (
              <span className={styles.logoPlaceholder}>Нет лого</span>
            )}
          </div>
          <div>
            <Button
              type="button"
              variant="soft"
              disabled={logoMutation.isPending}
              onClick={handleLogoButtonClick}
            >
              {logoMutation.isPending ? 'Загрузка...' : 'Загрузить логотип'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <TextField label="Адрес" error={errors.address?.message} {...register('address')} />
        <TextField label="Телефон" error={errors.phone?.message} {...register('phone')} />
        <TextField
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Часовой пояс"
          error={errors.timezone?.message}
          {...register('timezone')}
        />
        <TextField label="Валюта" error={errors.currency?.message} {...register('currency')} />
        <TextField label="Язык" error={errors.language?.message} {...register('language')} />

        <div className={styles.gridFull}>
          <SwitchToggle checked={isActive} label="Клиника активна" onChange={handleActiveChange} />
        </div>

        <div className={styles.gridFull}>
          <span className={styles.readonlyLabel}>Рабочие часы</span>
          <WorkingHoursEditor
            value={workingHours}
            onChange={handleWorkingHoursChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" disabled={!isDirty || isSubmitting} onClick={onSubmit}>
          {isSubmitting ? 'Сохраняем...' : 'Сохранить настройки'}
        </Button>
      </div>
    </section>
  );
};
