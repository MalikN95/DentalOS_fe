'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPlatformClinic } from '@/helpers/platform-admin.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PLATFORM_CLINIC_QUERY_KEY = 'platform-clinic';

export const usePlatformClinic = (id: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: [PLATFORM_CLINIC_QUERY_KEY, id],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPlatformClinic(accessToken, id, signal);
    },
    enabled: Boolean(accessToken) && Boolean(id),
  });
};
