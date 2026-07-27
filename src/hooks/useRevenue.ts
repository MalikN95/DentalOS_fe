'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRevenue } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseRevenueParams = {
  from: string;
  to: string;
};

export const useRevenue = ({ from, to }: UseRevenueParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'revenue', from, to],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchRevenue({ accessToken, from, to, signal });
    },
    enabled: Boolean(accessToken),
  });
};
