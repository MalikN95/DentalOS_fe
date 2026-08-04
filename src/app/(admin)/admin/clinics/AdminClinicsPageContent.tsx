'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { PlatformClinicSummary } from '@/common/types/platform-admin';
import { ClinicFormModal } from '@/components/admin/ClinicFormModal/ClinicFormModal';
import { ClinicsTable } from '@/components/admin/ClinicsTable/ClinicsTable';
import { SearchIcon } from '@/components/icons/icons';
import { Button, Pagination, TextField } from '@/components/ui';
import { deletePlatformClinic, updatePlatformClinic } from '@/helpers/platform-admin.api';
import { PLATFORM_CLINICS_QUERY_KEY, usePlatformClinics } from '@/hooks/usePlatformClinics';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';
import styles from './AdminClinicsPageContent.module.css';

export const AdminClinicsPageContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAppSelector(selectAccessToken);

  const {
    query,
    clinics,
    total,
    page,
    limit,
    searchInput,
    setSearchInput,
    setPage,
    setLimit,
  } = usePlatformClinics();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<PlatformClinicSummary | null>(null);

  const invalidateClinics = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [PLATFORM_CLINICS_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient]);

  const handleToggleActive = (clinic: PlatformClinicSummary) => {
    if (!accessToken) return;

    const message = clinic.isActive
      ? format(t.admin.confirmBlock, { name: clinic.name })
      : format(t.admin.confirmUnblock, { name: clinic.name });

    // eslint-disable-next-line no-alert -- simple confirmation, matches Tags/Branches pattern
    const confirmed = window.confirm(message);
    if (!confirmed) return;

    updatePlatformClinic(accessToken, clinic.id, { isActive: !clinic.isActive })
      .then(invalidateClinics)
      .catch(() => undefined);
  };

  const handleDelete = (clinic: PlatformClinicSummary) => {
    if (!accessToken) return;

    // eslint-disable-next-line no-alert -- simple confirmation, matches Tags/Branches pattern
    const confirmed = window.confirm(format(t.admin.confirmDelete, { name: clinic.name }));
    if (!confirmed) return;

    deletePlatformClinic(accessToken, clinic.id)
      .then(invalidateClinics)
      .catch(() => undefined);
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t.admin.navClinics}</h1>
          <p className={styles.subtitle}>
            {t.admin.colClinic}: {total}
          </p>
        </div>

        <TextField
          className={styles.search}
          size="sm"
          placeholder={t.admin.searchPlaceholder}
          iconLeft={<SearchIcon size={16} />}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        <Button className={styles.newButton} onClick={() => setIsCreateOpen(true)}>
          {t.admin.addClinic}
        </Button>
      </div>

      <ClinicsTable
        className={styles.tableSection}
        clinics={clinics}
        isLoading={query.isLoading}
        onRowClick={(clinic) => router.push(`/admin/clinics/${clinic.id}`)}
        onEdit={setEditingClinic}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        footer={
          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={setLimit} />
        }
      />

      {isCreateOpen ? (
        <ClinicFormModal onClose={() => setIsCreateOpen(false)} onSuccess={invalidateClinics} />
      ) : null}

      {editingClinic ? (
        <ClinicFormModal
          clinic={editingClinic}
          onClose={() => setEditingClinic(null)}
          onSuccess={invalidateClinics}
        />
      ) : null}
    </div>
  );
};
