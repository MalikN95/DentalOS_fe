'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCancellations } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseCancellationsParams = {
  from: string;
  to: string;
};

export const useCancellations = ({ from, to }: UseCancellationsParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'cancellations', from, to],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchCancellations({ accessToken, from, to, signal });
    },
    enabled: Boolean(accessToken),
  });
};
