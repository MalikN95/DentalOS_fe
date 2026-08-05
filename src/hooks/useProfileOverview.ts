'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Appointment } from '@/common/types/appointment';
import { fetchAppointmentsInRange } from '@/helpers/appointments.api';
import {
  type AppointmentOutcomeSummary,
  summarizeAppointmentsByOutcome,
} from '@/helpers/appointments-board';
import { isTerminalStatus } from '@/helpers/appointment-status';
import {
  addDays,
  getMonthIsoRange,
  getWeekDays,
  getWeekIsoRange,
  toDateInputValue,
} from '@/helpers/date';
import { useMyDoctorProfile } from '@/hooks/useMyDoctorProfile';
import { useReviews } from '@/hooks/useReviews';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PROFILE_OVERVIEW_QUERY_KEY = 'profile-overview';

const ACTIVITY_DAYS = 14;
const UPCOMING_LIMIT = 3;
const REVIEWS_SAMPLE_LIMIT = 50;
const REVIEWS_PREVIEW_LIMIT = 3;

const appointmentDateTime = (appointment: Appointment): Date => {
  const [hours, minutes] = appointment.time.split(':').map(Number);
  const [year, month, day] = appointment.date.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
};

export type ActivityDay = { date: string; count: number };

export const useProfileOverview = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const { doctorProfileId, isLoading: isDoctorProfileLoading } = useMyDoctorProfile();

  // Frozen once per mount — recomputing `new Date()` on every render would
  // change `from`/`to` by a few milliseconds each time, which (being part of
  // the query key below) would refetch forever instead of once.
  const bounds = useMemo(() => {
    const now = new Date();
    const activityStart = addDays(now, -(ACTIVITY_DAYS - 1));
    const weekRange = getWeekIsoRange(now);
    const monthRange = getMonthIsoRange(now);
    // Local 'YYYY-MM-DD' bounds for bucketing — `Appointment.date` is already
    // local-day (see appointments.mapper.ts), so comparisons here must stay in
    // local time too; the ISO range strings above are UTC and only fit for the
    // API request below, never for slicing a date-only string out of them.
    const weekDays = getWeekDays(now);

    return {
      now,
      activityStart,
      weekStartDate: toDateInputValue(weekDays[0]),
      weekEndDate: toDateInputValue(weekDays[6]),
      monthStartDate: toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1)),
      monthEndDate: toDateInputValue(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      // One request wide enough to cover the past 14 days plus this week and
      // this month (whichever bounds are widest) — everything else below is
      // derived from it.
      from: [activityStart.toISOString(), weekRange.from, monthRange.from].sort()[0],
      to: [weekRange.to, monthRange.to].sort().at(-1) as string,
    };
  }, []);
  const { now, activityStart, weekStartDate, weekEndDate, monthStartDate, monthEndDate, from, to } =
    bounds;

  const appointmentsQuery = useQuery({
    queryKey: [PROFILE_OVERVIEW_QUERY_KEY, from, to],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      // The backend auto-scopes to the caller's own doctor profile when
      // they're a doctor, and stays clinic-wide otherwise — no filter to pass.
      return fetchAppointmentsInRange(accessToken, { from, to });
    },
    enabled: Boolean(accessToken),
  });

  const {
    reviews: allReviews,
    query: reviewsQuery,
  } = useReviews({
    doctorProfileId: doctorProfileId ?? undefined,
    enabled: Boolean(doctorProfileId),
    initialLimit: REVIEWS_SAMPLE_LIMIT,
  });

  const appointments = appointmentsQuery.data ?? [];

  const upcoming = appointments
    .filter((appointment) => !isTerminalStatus(appointment.status))
    .filter((appointment) => appointmentDateTime(appointment).getTime() >= now.getTime())
    .sort((a, b) => appointmentDateTime(a).getTime() - appointmentDateTime(b).getTime())
    .slice(0, UPCOMING_LIMIT);

  const weekCount = appointments.filter(
    (appointment) => appointment.date >= weekStartDate && appointment.date <= weekEndDate,
  ).length;

  const monthAppointments = appointments.filter(
    (appointment) => appointment.date >= monthStartDate && appointment.date <= monthEndDate,
  );

  const activityByDay: ActivityDay[] = Array.from({ length: ACTIVITY_DAYS }, (_, index) => {
    const date = toDateInputValue(addDays(activityStart, index));
    return {
      date,
      count: appointments.filter((appointment) => appointment.date === date).length,
    };
  });

  const monthSummary: AppointmentOutcomeSummary = summarizeAppointmentsByOutcome(monthAppointments);

  const ratedReviews = allReviews.filter((review) => review.rating > 0);
  const averageRating = ratedReviews.length
    ? ratedReviews.reduce((sum, review) => sum + review.rating, 0) / ratedReviews.length
    : null;

  return {
    isLoading: appointmentsQuery.isLoading || isDoctorProfileLoading,
    errorMessage: appointmentsQuery.error?.message ?? null,
    doctorProfileId,
    upcoming,
    weekCount,
    monthCount: monthAppointments.length,
    monthAppointments,
    monthSummary,
    activityByDay,
    reviews: {
      isLoading: reviewsQuery.isLoading,
      preview: allReviews.slice(0, REVIEWS_PREVIEW_LIMIT),
      total: ratedReviews.length,
      averageRating,
    },
  };
};
