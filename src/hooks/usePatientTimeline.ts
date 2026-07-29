'use client';

import { useMemo } from 'react';
import type { TimelinePoint } from '@/common/types/timeline';
import { buildPatientTimeline } from '@/helpers/patient-timeline';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { usePatientInvoices } from '@/hooks/usePatientInvoices';

type UsePatientTimelineResult = {
  events: TimelinePoint[];
  isLoading: boolean;
};

// Assembles a patient's real system history (appointments, clinical records,
// invoices) into one chronological event list — shared by the patient profile
// page and any other place that embeds `PatientTimeline` for a given patient.
export const usePatientTimeline = (patientId: string): UsePatientTimelineResult => {
  const { upcoming, past, isVisitsLoading } = usePatientDetail(patientId);
  const { invoices, isLoading: isInvoicesLoading } = usePatientInvoices(patientId);

  const events = useMemo(
    () => buildPatientTimeline({ visits: [...upcoming, ...past], invoices }),
    [upcoming, past, invoices],
  );

  return { events, isLoading: isVisitsLoading || isInvoicesLoading };
};
