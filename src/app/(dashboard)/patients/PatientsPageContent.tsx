'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient, PatientsFilter } from '@/common/types/patient';
import { SearchIcon } from '@/components/icons/icons';
import { DeletePatientDialog } from '@/components/patients/DeletePatientDialog/DeletePatientDialog';
import { PatientFormModal } from '@/components/patients/PatientFormModal/PatientFormModal';
import { PatientsTable } from '@/components/patients/PatientsTable/PatientsTable';
import { Button, Pagination, TextField } from '@/components/ui';
import { PATIENTS_QUERY_KEY, usePatients } from '@/hooks/usePatients';
import { useDeletePatient } from '@/hooks/useDeletePatient';
import styles from './PatientsPageContent.module.css';

const FILTER_VALUES: PatientsFilter[] = ['all', 'active', 'inactive'];

export const PatientsPageContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();

  const filterLabels: Record<PatientsFilter, string> = {
    all: t.patients.filterAll,
    active: t.patients.filterActive,
    inactive: t.patients.filterInactive,
  };
  const {
    query,
    patients,
    total,
    page,
    limit,
    filter,
    searchInput,
    setSearchInput,
    setPage,
    setLimit,
    setFilter,
  } = usePatients();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const invalidatePatients = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient]);

  const deleteMutation = useDeletePatient({
    onSuccess: () => {
      invalidatePatients();
      setDeletingPatient(null);
    },
  });

  const handleConfirmDelete = useCallback(() => {
    if (deletingPatient) {
      deleteMutation.mutate(deletingPatient.id);
    }
  }, [deletingPatient, deleteMutation]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.patients.title}</h1>
          <p className={styles.subtitle}>
            {t.patients.total}: {total}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>{t.patients.newPatient}</Button>
      </div>

      <div className={styles.toolbar}>
        <TextField
          className={styles.search}
          placeholder={t.patients.searchPlaceholder}
          iconLeft={<SearchIcon size={18} />}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <div className={styles.filters}>
          {FILTER_VALUES.map((value) => (
            <Button
              key={value}
              variant={filter === value ? 'solid' : 'soft'}
              color={filter === value ? 'primary' : 'gray'}
              onClick={() => setFilter(value)}
            >
              {filterLabels[value]}
            </Button>
          ))}
        </div>
      </div>

      <PatientsTable
        className={styles.tableSection}
        patients={patients}
        isLoading={query.isLoading}
        errorMessage={query.error?.message ?? null}
        onRowClick={(patient) => router.push(`/patients/${patient.id}`)}
        onEdit={setEditingPatient}
        onDelete={setDeletingPatient}
        footer={
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        }
      />

      {isCreateOpen ? (
        <PatientFormModal onClose={() => setIsCreateOpen(false)} onSuccess={invalidatePatients} />
      ) : null}

      {editingPatient ? (
        <PatientFormModal
          patient={editingPatient}
          onClose={() => setEditingPatient(null)}
          onSuccess={invalidatePatients}
        />
      ) : null}

      {deletingPatient ? (
        <DeletePatientDialog
          patient={deletingPatient}
          isDeleting={deleteMutation.isPending}
          errorMessage={deleteMutation.error?.message ?? null}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingPatient(null)}
        />
      ) : null}
    </div>
  );
};
