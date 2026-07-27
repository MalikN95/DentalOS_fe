'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchServiceOptions } from '@/helpers/treatment-plans.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const useServiceOptions = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: ['services', 'options'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchServiceOptions(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return {
    services: query.data ?? [],
    isLoading: query.isLoading,
  };
};
