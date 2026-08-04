'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRepeatVisits } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseRepeatVisitsParams = {
  from: string;
  to: string;
};

export const useRepeatVisits = ({ from, to }: UseRepeatVisitsParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'repeat-visits', from, to],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchRepeatVisits({ accessToken, from, to, signal });
    },
    enabled: Boolean(accessToken),
  });
};
