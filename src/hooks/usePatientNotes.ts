'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPatientNote, fetchPatientNotes } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_NOTES_QUERY_KEY = 'patient-notes';

export const usePatientNotes = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PATIENT_NOTES_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientNotes(accessToken, patientId, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  const mutation = useMutation({
    mutationFn: (text: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createPatientNote(accessToken, patientId, text);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [PATIENT_NOTES_QUERY_KEY, patientId] })
        .catch(() => undefined);
    },
  });

  return {
    notes: query.data ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    mutation,
  };
};
