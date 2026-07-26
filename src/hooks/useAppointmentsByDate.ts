'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAppointmentsForDate } from '@/helpers/appointments.api';
import { toDateInputValue } from '@/helpers/date';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const APPOINTMENTS_BY_DATE_QUERY_KEY = ['appointments', 'by-date'] as const;

export const useAppointmentsByDate = (date: Date) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: [...APPOINTMENTS_BY_DATE_QUERY_KEY, toDateInputValue(date)],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchAppointmentsForDate({ accessToken, date, signal });
    },
    enabled: Boolean(accessToken),
  });
};
