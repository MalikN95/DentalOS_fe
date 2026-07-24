'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTodayAppointments } from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TODAY_APPOINTMENTS_QUERY_KEY = ['appointments', 'today'] as const;

export const useTodayAppointments = () => {
  const accessToken = useAppSelector(selectAccessToken);

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
