'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatientMessages } from '@/helpers/chat.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_MESSAGES_QUERY_KEY = 'patient-messages';

const LIMIT = 100;

export const usePatientMessages = (patientId: string | null) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PATIENT_MESSAGES_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken || !patientId) {
        throw new Error('Not authenticated');
      }

      return fetchPatientMessages(accessToken, patientId, { page: 1, limit: LIMIT }, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  // API returns newest-first; the thread renders oldest-to-newest.
  const messages = [...(query.data?.items ?? [])].reverse();

  return { messages, isLoading: query.isLoading, errorMessage: query.error?.message ?? null };
};
