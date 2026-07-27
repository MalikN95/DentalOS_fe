'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatientInvoices } from '@/helpers/invoices.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_INVOICES_QUERY_KEY = 'patient-invoices';

// Fetches the patient's full invoice history in one page — feeds both the
// Billing card (paginated client-side) and the timeline. A single patient's
// invoices are a small, bounded set, unlike the clinic-wide finance table.
export const usePatientInvoices = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PATIENT_INVOICES_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientInvoices(accessToken, patientId, 200, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  return {
    invoices: query.data?.items ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
