'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatientDemographics } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePatientDemographics = () => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'patients'],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPatientDemographics({ accessToken, signal });
    },
    enabled: Boolean(accessToken),
  });
};
