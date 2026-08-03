'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { PatientActions } from '@/components/patients/PatientActions/PatientActions';
import { PatientBilling } from '@/components/patients/PatientBilling/PatientBilling';
import { PatientDentalChart } from '@/components/patients/PatientDentalChart/PatientDentalChart';
import { PatientDocuments } from '@/components/patients/PatientDocuments/PatientDocuments';
import { PatientFormModal } from '@/components/patients/PatientFormModal/PatientFormModal';
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel/PatientInfoPanel';
import { PatientNotes } from '@/components/patients/PatientNotes/PatientNotes';
import { PatientTimeline } from '@/components/patients/PatientTimeline/PatientTimeline';
import { PatientTreatmentPlans } from '@/components/patients/PatientTreatmentPlans/PatientTreatmentPlans';
import { PatientVisits } from '@/components/patients/PatientVisits/PatientVisits';
import { SendEmailModal } from '@/components/patients/SendEmailModal/SendEmailModal';
import { ReviewsCard } from '@/components/reviews/ReviewsCard/ReviewsCard';
import { Alert } from '@/components/ui';
import { useClinic } from '@/hooks/useClinic';
import { usePatientDevLoginCode } from '@/hooks/usePatientDevLoginCode';
import { PATIENT_DETAIL_QUERY_KEY, usePatientDetail } from '@/hooks/usePatientDetail';
import { PATIENT_INVOICES_QUERY_KEY, usePatientInvoices } from '@/hooks/usePatientInvoices';
import { usePatientTimeline } from '@/hooks/usePatientTimeline';
import { PATIENTS_QUERY_KEY } from '@/hooks/usePatients';
import styles from './PatientDetailContent.module.css';

type PatientDetailContentProps = {
  patientId: string;
};

export const PatientDetailContent = ({ patientId }: PatientDetailContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSendEmailOpen, setIsSendEmailOpen] = useState(false);
  const { patient, upcoming, past, isLoading, isVisitsLoading, errorMessage } =
    usePatientDetail(patientId);
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';
  const {
    invoices,
    isLoading: isInvoicesLoading,
    errorMessage: invoicesErrorMessage,
  } = usePatientInvoices(patientId);
  const { events: timelineEvents, isLoading: isTimelineLoading } = usePatientTimeline(patientId);
  const { code: devLoginCode } = usePatientDevLoginCode(patientId);

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
    queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] }).catch(() => undefined);
  }, [queryClient, patientId]);

  return (
    <div className={styles.page}>
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      {isLoading ? <span className={styles.state}>{t.visits.loadingCard}</span> : null}

      {!isLoading && patient ? (
        <>
          <div className={`${styles.row} ${styles.profileRow}`}>
            <PatientInfoPanel
              patient={patient}
              devLoginCode={devLoginCode}
              onEdit={() => setIsEditOpen(true)}
            />
            <PatientDentalChart patientId={patientId} currency={currency} />
            <PatientVisits
              upcoming={upcoming}
              past={past}
              isLoading={isVisitsLoading}
              onAddAppointment={() => setIsCreateOpen(true)}
            />
          </div>

          <div className={styles.rowTwo}>
            <PatientBilling
              invoices={invoices}
              currency={currency}
              isLoading={isInvoicesLoading}
              errorMessage={invoicesErrorMessage}
            />
            <PatientTreatmentPlans patientId={patientId} currency={currency} />
            <PatientNotes patientId={patientId} />
          </div>

          <div className={styles.actionsRow}>
            <div className={styles.actionsSlot}>
              <PatientActions
                onAddAppointment={() => setIsCreateOpen(true)}
                onSendEmail={() => setIsSendEmailOpen(true)}
              />
            </div>
            <div className={styles.documentsSlot}>
              <PatientDocuments patientId={patientId} />
            </div>
          </div>

          <ReviewsCard patientId={patientId} />

          <PatientTimeline events={timelineEvents} currency={currency} isLoading={isTimelineLoading} />
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

      {isSendEmailOpen && patient ? (
        <SendEmailModal patient={patient} onClose={() => setIsSendEmailOpen(false)} />
      ) : null}
    </div>
  );
};
