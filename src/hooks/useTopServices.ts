'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTopServices } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseTopServicesParams = {
  from: string;
  to: string;
};

export const useTopServices = ({ from, to }: UseTopServicesParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'top-services', from, to],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchTopServices({ accessToken, from, to, signal });
    },
    enabled: Boolean(accessToken),
  });
};
