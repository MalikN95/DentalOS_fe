'use client';

import { useQuery } from '@tanstack/react-query';
import type { Appointment, AppointmentsViewMode } from '@/common/types/appointment';
import { fetchAppointmentsInRange } from '@/helpers/appointments.api';
import {
  getDayIsoRange,
  getMonthIsoRange,
  getWeekIsoRange,
  getYearMonths,
  toDateInputValue,
} from '@/helpers/date';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const APPOINTMENTS_BY_VIEW_QUERY_KEY = ['appointments', 'by-view'] as const;

const RANGE_BY_VIEW: Record<
  'day' | 'week' | 'month',
  (date: Date) => { from: string; to: string }
> = {
  day: getDayIsoRange,
  week: getWeekIsoRange,
  month: getMonthIsoRange,
};

// The backend caps any single `from`/`to` query at 62 days (appointments.service.ts#MAX_RANGE_DAYS)
// to keep the shared list endpoint bounded — a year is ~365, so Year view fetches month-by-month instead.
const fetchYearAppointments = (
  accessToken: string,
  date: Date,
  signal?: AbortSignal,
): Promise<Appointment[]> =>
  Promise.all(
    getYearMonths(date).map((month) =>
      fetchAppointmentsInRange(accessToken, getMonthIsoRange(month), signal),
    ),
  ).then((chunks) => chunks.flat());

// Backs all four calendar views — the query key includes both the view mode
// and the date so switching views (or navigating within one) caches independently.
export const useAppointmentsByView = (viewMode: AppointmentsViewMode, date: Date) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: [...APPOINTMENTS_BY_VIEW_QUERY_KEY, viewMode, toDateInputValue(date)],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      if (viewMode === 'year') {
        return fetchYearAppointments(accessToken, date, signal);
      }

      return fetchAppointmentsInRange(accessToken, RANGE_BY_VIEW[viewMode](date), signal);
    },
    enabled: Boolean(accessToken),
  });
};
