'use client';

import { useRef } from 'react';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ProfileOverview } from '@/components/dashboard/ProfileOverview/ProfileOverview';
import { UpcomingAppointmentsCard } from '@/components/dashboard/UpcomingAppointmentsCard/UpcomingAppointmentsCard';
import { EditIcon } from '@/components/icons/icons';
import { Alert, Button, TextField } from '@/components/ui';
import { useProfileOverview } from '@/hooks/useProfileOverview';
import { useProfileSettings } from '@/hooks/useProfileSettings';
import { EmailChangeModal } from './EmailChangeModal';
import styles from './AccountPageContent.module.css';

export const AccountPageContent = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profileQuery, form, updateMutation, avatarMutation, onSubmit, emailChange } =
    useProfileSettings();
  const {
    register,
    formState: { errors, isSubmitting, isDirty },
  } = form;
  const overview = useProfileOverview();

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
        <div className={styles.topRow}>
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
                <button
                  type="button"
                  className={styles.photoEditButton}
                  aria-label={avatarMutation.isPending ? t.uploading : t.uploadPhoto}
                  disabled={avatarMutation.isPending}
                  onClick={handlePhotoButtonClick}
                >
                  <EditIcon size={13} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={handlePhotoChange}
                />
              </div>
              <span className={styles.identityInfo}>
                <span className={styles.identityName}>
                  {profile.firstName} {profile.lastName}
                </span>
                {roleLabel ? <span className={styles.identityRole}>{roleLabel}</span> : null}
              </span>
            </div>

            <form className={styles.grid} onSubmit={onSubmit}>
              <TextField
                size="sm"
                label={t.firstName}
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <TextField
                size="sm"
                label={t.lastName}
                error={errors.lastName?.message}
                {...register('lastName')}
              />
              <TextField
                size="sm"
                label={t.email}
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <div className={styles.saveSlot}>
                <Button type="submit" className={styles.saveButton} disabled={isSaving || !isDirty}>
                  {isSaving ? t.saving : t.save}
                </Button>
              </div>
            </form>
          </section>

          <UpcomingAppointmentsCard appointments={overview.upcoming} />
        </div>
      ) : null}

      {profile ? <ProfileOverview {...overview} /> : null}

      {emailChange.isModalOpen ? (
        <EmailChangeModal
          email={emailChange.pendingEmail}
          code={emailChange.code}
          error={emailChange.error}
          resendCooldown={emailChange.resendCooldown}
          isConfirming={emailChange.isConfirming}
          isResending={emailChange.isRequesting}
          onCodeChange={emailChange.setCode}
          onConfirm={emailChange.confirm}
          onResend={emailChange.resend}
          onClose={emailChange.close}
        />
      ) : null}
    </div>
  );
};
