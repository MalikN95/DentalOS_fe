'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatients } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePatientOptions = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: ['patients', 'options'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatients(accessToken, { page: 1, limit: 200 }, signal);
    },
    enabled: Boolean(accessToken),
  });

  return {
    patients: query.data?.items ?? [],
    isLoading: query.isLoading,
  };
};
