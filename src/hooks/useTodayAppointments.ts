'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchTodayAppointments } from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TODAY_APPOINTMENTS_QUERY_KEY = ['appointments', 'today'] as const;

export const useTodayAppointments = () => {
  const router = useRouter();
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router]);

  return useQuery({
    queryKey: TODAY_APPOINTMENTS_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchTodayAppointments({ accessToken, signal });
    },
    enabled: Boolean(accessToken),
  });
};
