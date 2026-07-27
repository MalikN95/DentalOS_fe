'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAppointment } from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const APPOINTMENT_QUERY_KEY = 'appointment';

export const useAppointment = (appointmentId: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [APPOINTMENT_QUERY_KEY, appointmentId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchAppointment(accessToken, appointmentId, signal);
    },
    enabled: Boolean(accessToken),
  });

  return {
    appointment: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
