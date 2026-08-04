'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDoctorsLoad } from '@/helpers/analytics.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseDoctorsLoadParams = {
  from: string;
  to: string;
};

export const useDoctorsLoad = ({ from, to }: UseDoctorsLoadParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['analytics', 'doctors-load', from, to],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchDoctorsLoad({ accessToken, from, to, signal });
    },
    enabled: Boolean(accessToken),
  });
};
