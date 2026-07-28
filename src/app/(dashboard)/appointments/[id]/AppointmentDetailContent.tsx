'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { AppointmentStatus } from '@/common/types/appointment';
import { AppointmentManagePanel } from '@/components/dashboard/AppointmentManagePanel/AppointmentManagePanel';
import { PatientDentalChart } from '@/components/patients/PatientDentalChart/PatientDentalChart';
import { PatientInfoPanel } from '@/components/patients/PatientInfoPanel/PatientInfoPanel';
import { Alert, Badge } from '@/components/ui';
import { appointmentStatusColor } from '@/helpers/appointment-status';
import { useAppointment } from '@/hooks/useAppointment';
import { useClinic } from '@/hooks/useClinic';
import { usePatient } from '@/hooks/usePatient';
import styles from './AppointmentDetailContent.module.css';

type AppointmentDetailContentProps = {
  appointmentId: string;
};

export const AppointmentDetailContent = ({ appointmentId }: AppointmentDetailContentProps) => {
  const { t } = useTranslation();
  const {
    appointment,
    isLoading: isAppointmentLoading,
    errorMessage: appointmentError,
  } = useAppointment(appointmentId);
  const [status, setStatus] = useState<AppointmentStatus | null>(null);

  const { patient, isLoading: isPatientLoading } = usePatient(appointment?.patientId ?? '');
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  const isLoading = isAppointmentLoading || (Boolean(appointment) && isPatientLoading);
  const displayStatus = status ?? appointment?.status;

  return (
    <div className={styles.page}>
      <Link href="/appointments" className={styles.back}>
        ← {t.appointments.backToList}
      </Link>

      {appointmentError ? <Alert color="danger">{appointmentError}</Alert> : null}

      {isLoading ? <span className={styles.state}>{t.appointments.loadingCard}</span> : null}

      {!isLoading && !appointment ? (
        <span className={styles.state}>{t.appointments.notFound}</span>
      ) : null}

      {!isLoading && appointment ? (
        <>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {appointment.patientName} · {appointment.service}
            </h1>
            {displayStatus ? (
              <Badge color={appointmentStatusColor[displayStatus]}>
                {t.appointmentStatus[displayStatus]}
              </Badge>
            ) : null}
          </div>

          <div className={styles.layout}>
            {patient ? (
              <div className={styles.sidebar}>
                <PatientInfoPanel patient={patient} />
                <PatientDentalChart patientId={patient.id} currency={currency} />
              </div>
            ) : null}
            <AppointmentManagePanel
              appointment={appointment}
              className={styles.panel}
              onStatusChange={setStatus}
            />
          </div>
        </>
      ) : null}
    </div>
  );
};
