'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel/PatientInfoPanel';
import { PatientVisits } from '@/components/patients/PatientVisits/PatientVisits';
import { Alert } from '@/components/ui';
import { PATIENT_DETAIL_QUERY_KEY, usePatientDetail } from '@/hooks/usePatientDetail';
import styles from './PatientDetailContent.module.css';

type PatientDetailContentProps = {
  patientId: string;
};

export const PatientDetailContent = ({ patientId }: PatientDetailContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { patient, upcoming, past, isLoading, isVisitsLoading, errorMessage } =
    usePatientDetail(patientId);

  const handleAppointmentCreated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId] })
      .catch(() => undefined);
  }, [queryClient, patientId]);

  return (
    <div className={styles.page}>
      <Link href="/patients" className={styles.back}>
        ← {t.visits.back}
      </Link>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      {isLoading ? <span className={styles.state}>{t.visits.loadingCard}</span> : null}

      {!isLoading && patient ? (
        <div className={styles.layout}>
          <PatientInfoPanel patient={patient} />
          <PatientVisits
            upcoming={upcoming}
            past={past}
            isLoading={isVisitsLoading}
            onAddClick={() => setIsCreateOpen(true)}
          />
        </div>
      ) : null}

      {isCreateOpen ? (
        <CreateAppointmentModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handleAppointmentCreated}
        />
      ) : null}
    </div>
  );
};
