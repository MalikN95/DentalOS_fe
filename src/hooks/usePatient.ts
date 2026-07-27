'use client';

import { useQuery } from '@tanstack/react-query';
import { PATIENT_DETAIL_QUERY_KEY } from '@/hooks/usePatientDetail';
import { fetchPatient } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePatient = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId, 'patient'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatient(accessToken, patientId, signal);
    },
    enabled: Boolean(accessToken),
  });

  return {
    patient: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
