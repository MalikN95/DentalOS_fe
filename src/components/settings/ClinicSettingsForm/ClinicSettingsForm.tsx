'use client';

import { useRef, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useTranslation, type Language } from '@/common/locale/LocaleProvider';
import type { WorkingHours } from '@/common/types/settings';
import { Alert, Button, SearchSelect, SwitchToggle, TextField } from '@/components/ui';
import { SaveSettingsModal } from '@/components/settings/SaveSettingsModal/SaveSettingsModal';
import { WorkingHoursEditor } from '@/components/settings/WorkingHoursEditor/WorkingHoursEditor';
import { useClinicSettings } from '@/hooks/useClinicSettings';
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS } from '@/helpers/locale-options';
import { buildClinicBookingUrl } from '@/helpers/tenant';
import styles from './ClinicSettingsForm.module.css';

const COPY_FEEDBACK_MS = 2000;

export const ClinicSettingsForm = () => {
  'use no memo';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { clinicQuery, form, updateMutation, logoMutation } = useClinicSettings();

  const {
    register,
    control,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const workingHours = useWatch({ control, name: 'workingHours' });
  const isActive = useWatch({ control, name: 'isActive' });
  const clinic = clinicQuery.data;

  const { t: dict, setLanguage } = useTranslation();
  const t = dict.settings;

  const isSupportedLanguage = (value: string): value is Language =>
    value === 'ru' || value === 'en' || value === 'ky';

  // Confirmed from the modal: validate, update the profile, close on success.
  const handleConfirmSave = form.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      setIsSaveOpen(false);
    } catch {
      // error surfaced via updateMutation.error inside the modal
    }
  });

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

  const handleCopyBookingLink = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), COPY_FEEDBACK_MS);
      })
      .catch(() => undefined);
  };

  if (clinicQuery.isLoading) {
    return <div className={styles.section}>{t.loading}</div>;
  }

  if (clinicQuery.error) {
    return (
      <div className={styles.section}>
        <Alert color="danger">{clinicQuery.error.message}</Alert>
      </div>
    );
  }

  const isSaving = isSubmitting || updateMutation.isPending;

  return (
    <section className={styles.section}>
      <p className={styles.description}>{t.clinicSubtitle}</p>

      {clinic?.subdomain ? (
        <div className={styles.bookingLink}>
          <span className={styles.fieldLabel}>{t.bookingLinkLabel}</span>
          <div className={styles.bookingLinkRow}>
            <a
              href={buildClinicBookingUrl(clinic.subdomain)}
              target="_blank"
              rel="noreferrer"
              className={styles.bookingLinkValue}
            >
              {buildClinicBookingUrl(clinic.subdomain)}
            </a>
            <button
              type="button"
              className={styles.copyButton}
              onClick={() => handleCopyBookingLink(buildClinicBookingUrl(clinic.subdomain))}
            >
              {isLinkCopied ? t.bookingLinkCopied : t.bookingLinkCopy}
            </button>
          </div>
        </div>
      ) : null}

      {logoMutation.error ? <Alert color="danger">{logoMutation.error.message}</Alert> : null}

      <div className={styles.identity}>
        <div className={styles.logoPreview}>
          {clinic?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL
            <img src={clinic.logoUrl} alt={t.uploadLogo} className={styles.logoImage} />
          ) : (
            <span className={styles.logoPlaceholder}>{t.noLogo}</span>
          )}
        </div>
        <span className={styles.identityName}>{clinic?.name ?? '—'}</span>
        <button
          type="button"
          className={styles.logoLink}
          disabled={logoMutation.isPending}
          onClick={handleLogoButtonClick}
        >
          {logoMutation.isPending ? t.uploading : t.uploadLogo}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={handleLogoChange}
        />
      </div>

      <div className={styles.grid}>
        <TextField label={t.address} error={errors.address?.message} {...register('address')} />
        <TextField label={t.phone} error={errors.phone?.message} {...register('phone')} />
        <TextField
          label={t.email}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Controller
          control={control}
          name="timezone"
          render={({ field, fieldState }) => (
            <SearchSelect
              label={t.timezone}
              value={field.value}
              options={TIMEZONE_OPTIONS}
              placeholder={t.selectTimezone}
              searchPlaceholder={t.searchTimezone}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field, fieldState }) => (
            <SearchSelect
              label={t.currency}
              value={field.value}
              options={CURRENCY_OPTIONS}
              placeholder={t.selectCurrency}
              searchPlaceholder={t.searchCurrency}
              error={fieldState.error?.message}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="language"
          render={({ field, fieldState }) => (
            <SearchSelect
              label={t.language}
              value={field.value}
              options={LANGUAGE_OPTIONS}
              placeholder={t.selectLanguage}
              searchPlaceholder={t.searchLanguage}
              error={fieldState.error?.message}
              onChange={(value) => {
                field.onChange(value);
                if (isSupportedLanguage(value)) {
                  setLanguage(value);
                }
              }}
            />
          )}
        />

        <div className={styles.gridFull}>
          <SwitchToggle checked={isActive} label={t.active} onChange={handleActiveChange} />
        </div>

        <div className={styles.gridFull}>
          <span className={styles.fieldLabel}>{t.workingHours}</span>
          <WorkingHoursEditor
            value={workingHours}
            onChange={handleWorkingHoursChange}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" disabled={!isDirty || isSaving} onClick={() => setIsSaveOpen(true)}>
          {t.save}
        </Button>
      </div>

      {isSaveOpen ? (
        <SaveSettingsModal
          title={t.confirmTitle}
          text={t.confirmText}
          confirmLabel={t.confirm}
          cancelLabel={t.cancel}
          savingLabel={t.saving}
          isSaving={isSaving}
          errorMessage={updateMutation.error?.message ?? null}
          onConfirm={handleConfirmSave}
          onClose={() => setIsSaveOpen(false)}
        />
      ) : null}
    </section>
  );
};
