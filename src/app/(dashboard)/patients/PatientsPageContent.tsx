'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Patient, PatientsFilter } from '@/common/types/patient';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { SearchIcon } from '@/components/icons/icons';
import { PatientFormModal } from '@/components/patients/PatientFormModal/PatientFormModal';
import { PatientPaymentModal } from '@/components/patients/PatientPaymentModal/PatientPaymentModal';
import { PatientTagFilter } from '@/components/patients/PatientTagFilter/PatientTagFilter';
import { PatientsTable } from '@/components/patients/PatientsTable/PatientsTable';
import { SendEmailModal } from '@/components/patients/SendEmailModal/SendEmailModal';
import { CreateTreatmentPlanModal } from '@/components/treatment-plans/CreateTreatmentPlanModal/CreateTreatmentPlanModal';
import { Button, type ButtonColor, Pagination, TextField } from '@/components/ui';
import { useClinic } from '@/hooks/useClinic';
import { PATIENTS_QUERY_KEY, usePatients } from '@/hooks/usePatients';
import styles from './PatientsPageContent.module.css';

const FILTER_VALUES: PatientsFilter[] = ['all', 'active', 'inactive'];

const FILTER_COLORS: Record<PatientsFilter, ButtonColor> = {
  all: 'primary',
  active: 'success',
  inactive: 'warning',
};

export const PatientsPageContent = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

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
    tagIds,
    searchInput,
    setSearchInput,
    setPage,
    setLimit,
    setFilter,
    setTagIds,
  } = usePatients(searchParams.get('search') ?? '');

  // Opens the create-patient modal when arriving from the top-nav "+ New
  // patient" shortcut (`/patients?new=1`).
  const [isCreateOpen, setIsCreateOpen] = useState(() => searchParams.get('new') === '1');
  const [appointmentPatient, setAppointmentPatient] = useState<Patient | null>(null);
  const [treatmentPlanPatient, setTreatmentPlanPatient] = useState<Patient | null>(null);
  const [paymentPatient, setPaymentPatient] = useState<Patient | null>(null);
  const [emailPatient, setEmailPatient] = useState<Patient | null>(null);

  const invalidatePatients = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient]);

  // Strips the one-shot `new` flag from the URL so a refresh or the back
  // button doesn't reopen the modal.
  useEffect(() => {
    if (searchParams.get('new') !== '1') return;

    const params = new URLSearchParams(searchParams.toString());
    params.delete('new');
    router.replace(params.toString() ? `/patients?${params.toString()}` : '/patients');
    // Runs once on mount to consume the one-shot URL flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{t.patients.title}</h1>
          <p className={styles.subtitle}>
            {t.patients.total}: {total}
          </p>
        </div>

        <div className={styles.toolbar}>
          <PatientTagFilter selectedIds={tagIds} onChange={setTagIds} />

          <TextField
            className={styles.search}
            size="sm"
            placeholder={t.patients.searchPlaceholder}
            iconLeft={<SearchIcon size={16} />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />

          <div className={styles.filters}>
            {FILTER_VALUES.map((value) => (
              <Button
                key={value}
                className={styles.filterButton}
                variant={filter === value ? 'solid' : 'soft'}
                color={FILTER_COLORS[value]}
                onClick={() => setFilter(value)}
              >
                {filterLabels[value]}
              </Button>
            ))}
          </div>
        </div>

        <Button className={styles.newButton} onClick={() => setIsCreateOpen(true)}>
          {t.patients.newPatient}
        </Button>
      </div>

      <PatientsTable
        className={styles.tableSection}
        patients={patients}
        isLoading={query.isLoading}
        errorMessage={query.error?.message ?? null}
        onRowClick={(patient) => router.push(`/patients/${patient.id}`)}
        onAddAppointment={setAppointmentPatient}
        onSendEmail={setEmailPatient}
        onTreatmentPlan={setTreatmentPlanPatient}
        onRecordPayment={setPaymentPatient}
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

      {appointmentPatient ? (
        <CreateAppointmentModal
          initialPatientId={appointmentPatient.id}
          onClose={() => setAppointmentPatient(null)}
          onSuccess={() => setAppointmentPatient(null)}
        />
      ) : null}

      {treatmentPlanPatient ? (
        <CreateTreatmentPlanModal
          initialPatientId={treatmentPlanPatient.id}
          onClose={() => setTreatmentPlanPatient(null)}
        />
      ) : null}

      {paymentPatient ? (
        <PatientPaymentModal
          patientId={paymentPatient.id}
          currency={currency}
          onClose={() => setPaymentPatient(null)}
        />
      ) : null}

      {emailPatient ? (
        <SendEmailModal patient={emailPatient} onClose={() => setEmailPatient(null)} />
      ) : null}
    </div>
  );
};
