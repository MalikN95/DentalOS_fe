'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRevenue } from '@/helpers/analytics.api';
import { getTodayIsoRange } from '@/helpers/date';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TODAY_REVENUE_QUERY_KEY = ['analytics', 'revenue', 'today'] as const;

export const useTodayRevenue = (enabled: boolean) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: TODAY_REVENUE_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const { from, to } = getTodayIsoRange();
      return fetchRevenue({ accessToken, from, to, signal });
    },
    enabled: enabled && Boolean(accessToken),
    retry: false,
  });
};
