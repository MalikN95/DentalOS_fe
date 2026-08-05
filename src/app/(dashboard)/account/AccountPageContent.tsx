'use client';

import { useRef } from 'react';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Button, TextField } from '@/components/ui';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import styles from './AccountPageContent.module.css';

export const AccountPageContent = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profileQuery, form, updateMutation, avatarMutation, onSubmit } = useProfileSettings();
  const {
    register,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const { t: dict } = useTranslation();
  const t = dict.account;
  const profile = profileQuery.data;
  const roleKey = profile?.role as keyof Dictionary['roles'] | undefined;
  const roleLabel = roleKey ? (dict.roles[roleKey] ?? profile?.role) : null;

  const handlePhotoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    avatarMutation.mutate(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isSaving = isSubmitting || updateMutation.isPending;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.pageTitle}>{t.pageTitle}</h1>
        <p className={styles.pageDescription}>{t.pageDescription}</p>
      </div>

      {profileQuery.isLoading ? <p className={styles.state}>{t.loading}</p> : null}

      {profile ? (
        <section className={styles.section}>
          {avatarMutation.error ? <Alert color="danger">{avatarMutation.error.message}</Alert> : null}
          {updateMutation.error ? <Alert color="danger">{updateMutation.error.message}</Alert> : null}

          <div className={styles.identity}>
            <div className={styles.photoPreview}>
              {profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL
                <img src={profile.avatarUrl} alt={t.uploadPhoto} className={styles.photoImage} />
              ) : (
                <span className={styles.photoPlaceholder}>{t.noPhoto}</span>
              )}
            </div>
            <span className={styles.identityName}>
              {profile.firstName} {profile.lastName}
            </span>
            <button
              type="button"
              className={styles.photoLink}
              disabled={avatarMutation.isPending}
              onClick={handlePhotoButtonClick}
            >
              {avatarMutation.isPending ? t.uploading : t.uploadPhoto}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              onChange={handlePhotoChange}
            />
          </div>

          <form className={styles.grid} onSubmit={onSubmit}>
            <TextField
              label={t.firstName}
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label={t.lastName}
              error={errors.lastName?.message}
              {...register('lastName')}
            />
            <TextField label={t.email} value={profile.email} disabled readOnly />
            <TextField label={t.role} value={roleLabel ?? ''} disabled readOnly />

            <div className={styles.actions}>
              <Button type="submit" disabled={isSaving || !isDirty}>
                {isSaving ? t.saving : t.save}
              </Button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
};
