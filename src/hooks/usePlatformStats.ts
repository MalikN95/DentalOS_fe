'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchPlatformClinicsGrowth,
  fetchPlatformOverview,
  fetchPlatformRevenueByMonth,
} from '@/helpers/platform-admin.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const DEFAULT_MONTHS = 12;

export const usePlatformOverview = () => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['platform-stats', 'overview'],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPlatformOverview(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });
};

export const usePlatformRevenueByMonth = (months = DEFAULT_MONTHS) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['platform-stats', 'revenue-by-month', months],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPlatformRevenueByMonth(accessToken, months, signal);
    },
    enabled: Boolean(accessToken),
  });
};

export const usePlatformClinicsGrowth = (months = DEFAULT_MONTHS) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: ['platform-stats', 'clinics-growth', months],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPlatformClinicsGrowth(accessToken, months, signal);
    },
    enabled: Boolean(accessToken),
  });
};
