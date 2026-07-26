'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatients } from '@/helpers/patients.api';
import { getTodayIsoRange } from '@/helpers/date';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const NEW_PATIENTS_TODAY_QUERY_KEY = ['patients', 'new', 'today'] as const;

export const useNewPatientsToday = () => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: NEW_PATIENTS_TODAY_QUERY_KEY,
    queryFn: async ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const { from, to } = getTodayIsoRange();
      const result = await fetchPatients(
        accessToken,
        { page: 1, limit: 1, createdFrom: from, createdTo: to },
        signal,
      );

      return result.total;
    },
    enabled: Boolean(accessToken),
  });
};
