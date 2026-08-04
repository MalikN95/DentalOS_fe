'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import { ClinicFormModal } from '@/components/admin/ClinicFormModal/ClinicFormModal';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { ChevronLeftIcon, PatientsIcon, StaffIcon, WalletIcon } from '@/components/icons/icons';
import { Alert, Badge, Button } from '@/components/ui';
import { deletePlatformClinic, updatePlatformClinic } from '@/helpers/platform-admin.api';
import { PLATFORM_CLINIC_QUERY_KEY, usePlatformClinic } from '@/hooks/usePlatformClinic';
import { PLATFORM_CLINICS_QUERY_KEY } from '@/hooks/usePlatformClinics';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';
import styles from './AdminClinicDetailContent.module.css';

const numberFormatter = new Intl.NumberFormat('ru-RU');
const formatNumber = (value: number) => numberFormatter.format(value);

type AdminClinicDetailContentProps = {
  clinicId: string;
};

export const AdminClinicDetailContent = ({ clinicId }: AdminClinicDetailContentProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAppSelector(selectAccessToken);
  const { data: clinic, isLoading, error } = usePlatformClinic(clinicId);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const invalidate = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [PLATFORM_CLINIC_QUERY_KEY, clinicId] })
      .catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: [PLATFORM_CLINICS_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient, clinicId]);

  const handleToggleActive = () => {
    if (!accessToken || !clinic) return;

    const message = clinic.isActive
      ? format(t.admin.confirmBlock, { name: clinic.name })
      : format(t.admin.confirmUnblock, { name: clinic.name });

    // eslint-disable-next-line no-alert -- simple confirmation, matches Tags/Branches pattern
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    updatePlatformClinic(accessToken, clinic.id, { isActive: !clinic.isActive })
      .then(invalidate)
      .catch(() => undefined);
  };

  const handleDelete = () => {
    if (!accessToken || !clinic) return;

    // eslint-disable-next-line no-alert -- simple confirmation, matches Tags/Branches pattern
    const confirmed = window.confirm(format(t.admin.confirmDelete, { name: clinic.name }));
    if (!confirmed) return;

    deletePlatformClinic(accessToken, clinic.id)
      .then(() => {
        queryClient
          .invalidateQueries({ queryKey: [PLATFORM_CLINICS_QUERY_KEY] })
          .catch(() => undefined);
        router.push('/admin/clinics');
      })
      .catch(() => undefined);
  };

  return (
    <div className={styles.page}>
      <button type="button" className={styles.backLink} onClick={() => router.push('/admin/clinics')}>
        <ChevronLeftIcon size={16} />
        {t.admin.navClinics}
      </button>

      {error ? <Alert color="danger">{error.message}</Alert> : null}
      {isLoading ? <span className={styles.state}>{t.admin.loading}</span> : null}

      {!isLoading && clinic ? (
        <>
          <div className={styles.headerRow}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>{clinic.name}</h1>
              <Badge color={clinic.isActive ? 'success' : 'gray'}>
                {clinic.isActive ? t.common.active : t.admin.statusBlocked}
              </Badge>
            </div>

            <div className={styles.actions}>
              <Button variant="soft" color="gray" onClick={() => setIsEditOpen(true)}>
                {t.admin.actionEdit}
              </Button>
              <Button variant="soft" color={clinic.isActive ? 'danger' : 'success'} onClick={handleToggleActive}>
                {clinic.isActive ? t.admin.actionBlock : t.admin.actionUnblock}
              </Button>
              <Button variant="soft" color="danger" onClick={handleDelete}>
                {t.admin.actionDelete}
              </Button>
            </div>
          </div>

          <div className={styles.stats}>
            <StatCard
              label={t.admin.statTotalDoctors}
              value={formatNumber(clinic.doctorsCount)}
              icon={<StaffIcon size={16} />}
              accent="success"
            />
            <StatCard
              label={t.admin.statTotalPatients}
              value={formatNumber(clinic.patientsCount)}
              icon={<PatientsIcon size={16} />}
              accent="primary"
            />
            <StatCard
              label={t.admin.statTotalRevenue}
              value={formatNumber(clinic.totalRevenue)}
              icon={<WalletIcon size={16} />}
              accent="success"
            />
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.infoTitle}>{t.admin.detailInfoTitle}</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.slug}</span>
                <span className={styles.infoValue}>/{clinic.slug}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.address}</span>
                <span className={styles.infoValue}>{clinic.address ?? t.common.dash}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.phone}</span>
                <span className={styles.infoValue}>{clinic.phone ?? t.common.dash}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.email}</span>
                <span className={styles.infoValue}>{clinic.email ?? t.common.dash}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.timezone}</span>
                <span className={styles.infoValue}>{clinic.timezone}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>{t.admin.form.currency}</span>
                <span className={styles.infoValue}>{clinic.currency}</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {isEditOpen && clinic ? (
        <ClinicFormModal clinic={clinic} onClose={() => setIsEditOpen(false)} onSuccess={invalidate} />
      ) : null}
    </div>
  );
};
