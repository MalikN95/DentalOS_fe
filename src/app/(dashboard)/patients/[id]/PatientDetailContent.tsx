'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { PatientActions } from '@/components/patients/PatientActions/PatientActions';
import { PatientBilling } from '@/components/patients/PatientBilling/PatientBilling';
import { PatientDentalChart } from '@/components/patients/PatientDentalChart/PatientDentalChart';
import { PatientFormModal } from '@/components/patients/PatientFormModal/PatientFormModal';
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel/PatientInfoPanel';
import { PatientTimeline } from '@/components/patients/PatientTimeline/PatientTimeline';
import { PatientTreatmentPlans } from '@/components/patients/PatientTreatmentPlans/PatientTreatmentPlans';
import { PatientVisits } from '@/components/patients/PatientVisits/PatientVisits';
import { Alert } from '@/components/ui';
import { buildPatientTimeline } from '@/helpers/patient-timeline';
import { useClinic } from '@/hooks/useClinic';
import { PATIENT_DETAIL_QUERY_KEY, usePatientDetail } from '@/hooks/usePatientDetail';
import { PATIENT_INVOICES_QUERY_KEY, usePatientInvoices } from '@/hooks/usePatientInvoices';
import styles from './PatientDetailContent.module.css';

type PatientDetailContentProps = {
  patientId: string;
};

export const PatientDetailContent = ({ patientId }: PatientDetailContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { patient, upcoming, past, isLoading, isVisitsLoading, errorMessage } =
    usePatientDetail(patientId);
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';
  const {
    invoices,
    isLoading: isInvoicesLoading,
    errorMessage: invoicesErrorMessage,
  } = usePatientInvoices(patientId);

  const timelineEvents = useMemo(
    () => buildPatientTimeline({ visits: [...upcoming, ...past], invoices }),
    [upcoming, past, invoices],
  );

  const handleAppointmentCreated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId] })
      .catch(() => undefined);
    queryClient
      .invalidateQueries({ queryKey: [PATIENT_INVOICES_QUERY_KEY, patientId] })
      .catch(() => undefined);
  }, [queryClient, patientId]);

  const handlePatientUpdated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId] })
      .catch(() => undefined);
  }, [queryClient, patientId]);

  return (
    <div className={styles.page}>
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      {isLoading ? <span className={styles.state}>{t.visits.loadingCard}</span> : null}

      {!isLoading && patient ? (
        <>
          <div className={`${styles.row} ${styles.profileRow}`}>
            <PatientInfoPanel patient={patient} onEdit={() => setIsEditOpen(true)} />
            <PatientDentalChart patientId={patientId} currency={currency} />
            <PatientVisits
              upcoming={upcoming}
              past={past}
              isLoading={isVisitsLoading}
              onAddAppointment={() => setIsCreateOpen(true)}
            />
          </div>

          <div className={styles.row}>
            <PatientBilling
              invoices={invoices}
              currency={currency}
              isLoading={isInvoicesLoading}
              errorMessage={invoicesErrorMessage}
            />
            <PatientActions onAddAppointment={() => setIsCreateOpen(true)} />
            <PatientTreatmentPlans patientId={patientId} currency={currency} />
          </div>

          <PatientTimeline
            events={timelineEvents}
            currency={currency}
            isLoading={isVisitsLoading || isInvoicesLoading}
          />
        </>
      ) : null}

      {isCreateOpen ? (
        <CreateAppointmentModal
          initialPatientId={patientId}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      ) : null}

      {isEditOpen && patient ? (
        <PatientFormModal
          patient={patient}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handlePatientUpdated}
        />
      ) : null}
    </div>
  );
};
