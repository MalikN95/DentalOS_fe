'use client';

import { useCallback, useId, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { StaffRole } from '@/common/types/staff';
import { CreateTreatmentPlanModal } from '@/components/treatment-plans/CreateTreatmentPlanModal/CreateTreatmentPlanModal';
import { TreatmentPlanCard } from '@/components/treatment-plans/TreatmentPlanCard/TreatmentPlanCard';
import { TreatmentPlanDetailModal } from '@/components/treatment-plans/TreatmentPlanDetailModal/TreatmentPlanDetailModal';
import { Alert, Button, EmptyState, Pagination, SearchSelect } from '@/components/ui';
import { parseDateInputValue } from '@/helpers/date';
import { useClinic } from '@/hooks/useClinic';
import { usePatientOptions } from '@/hooks/usePatientOptions';
import { useTreatmentPlans } from '@/hooks/useTreatmentPlans';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './TreatmentPlansPageContent.module.css';

const EDIT_ROLES: StaffRole[] = ['owner', 'admin', 'doctor'];

type TreatmentPlansPageContentProps = {
  initialPatientId: string | null;
};

export const TreatmentPlansPageContent = ({
  initialPatientId,
}: TreatmentPlansPageContentProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const router = useRouter();
  const dateFromFieldId = useId();
  const dateToFieldId = useId();
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canEdit = EDIT_ROLES.includes(currentUser.role as StaffRole);

  const [patientId, setPatientId] = useState(initialPatientId ?? '');
  // Kept as plain date-input values; converted to ISO bounds only when querying.
  const [dateFromInput, setDateFromInput] = useState('');
  const [dateToInput, setDateToInput] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [openPlanId, setOpenPlanId] = useState<string | null>(null);

  const { patients } = usePatientOptions();
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  const dateFrom = dateFromInput ? parseDateInputValue(dateFromInput).toISOString() : undefined;
  const dateTo = (() => {
    if (!dateToInput) return undefined;
    const end = parseDateInputValue(dateToInput);
    end.setHours(23, 59, 59, 999);
    return end.toISOString();
  })();

  const {
    plans,
    total,
    page,
    limit,
    setPage,
    setLimit,
    isLoading,
    errorMessage,
    deleteMutation,
  } = useTreatmentPlans({ patientId: patientId || undefined, dateFrom, dateTo });

  const patientOptions = useMemo(
    () => [
      { value: '', label: t.allPatients },
      ...patients.map((patient) => ({
        value: patient.id,
        label: `${patient.lastName} ${patient.firstName}${patient.phone ? ` · ${patient.phone}` : ''}`,
      })),
    ],
    [patients, t.allPatients],
  );

  const handlePatientChange = useCallback(
    (value: string) => {
      setPatientId(value);
      router.replace(value ? `/treatment-plans?patientId=${value}` : '/treatment-plans');
    },
    [router],
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.description}</p>
        </div>
        {canEdit ? <Button onClick={() => setIsCreateOpen(true)}>{t.newPlan}</Button> : null}
      </div>

      <div className={styles.filters}>
        <SearchSelect
          className={styles.patientFilter}
          label={t.patientLabel}
          value={patientId}
          options={patientOptions}
          placeholder={t.selectPatientPlaceholder}
          searchPlaceholder={t.searchPatientPlaceholder}
          onChange={handlePatientChange}
        />

        <label className={styles.dateField} htmlFor={dateFromFieldId}>
          <span className={styles.dateLabel}>{t.dateFrom}</span>
          <input
            id={dateFromFieldId}
            type="date"
            className={styles.dateInput}
            value={dateFromInput}
            onChange={(event) => setDateFromInput(event.target.value)}
          />
        </label>

        <label className={styles.dateField} htmlFor={dateToFieldId}>
          <span className={styles.dateLabel}>{t.dateTo}</span>
          <input
            id={dateToFieldId}
            type="date"
            className={styles.dateInput}
            value={dateToInput}
            onChange={(event) => setDateToInput(event.target.value)}
          />
        </label>
      </div>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      {isLoading ? <span className={styles.state}>{t.loading}</span> : null}

      {!isLoading && plans.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDesc} />
      ) : null}

      {!isLoading && plans.length > 0 ? (
        <>
          <div className={styles.grid}>
            {plans.map((plan) => (
              <TreatmentPlanCard
                key={plan.id}
                plan={plan}
                currency={currency}
                onClick={() => setOpenPlanId(plan.id)}
              />
            ))}
          </div>

          <Pagination page={page} limit={limit} total={total} onPageChange={setPage} onLimitChange={setLimit} />
        </>
      ) : null}

      {isCreateOpen ? (
        <CreateTreatmentPlanModal
          initialPatientId={patientId || undefined}
          onClose={() => setIsCreateOpen(false)}
        />
      ) : null}

      {openPlanId ? (
        <TreatmentPlanDetailModal
          planId={openPlanId}
          currency={currency}
          canEdit={canEdit}
          deleteMutation={deleteMutation}
          onClose={() => setOpenPlanId(null)}
          onDeleted={() => setOpenPlanId(null)}
        />
      ) : null}
    </div>
  );
};
