'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateScheduleExceptionInput } from '@/common/types/schedule';
import {
  createScheduleException,
  deleteScheduleException,
  fetchScheduleExceptions,
} from '@/helpers/schedules.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const DOCTOR_SCHEDULE_EXCEPTIONS_QUERY_KEY = 'doctor-schedule-exceptions';

export const useDoctorScheduleExceptions = (doctorProfileId: string | null | undefined) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [DOCTOR_SCHEDULE_EXCEPTIONS_QUERY_KEY, doctorProfileId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchScheduleExceptions(accessToken, doctorProfileId as string, signal);
    },
    enabled: Boolean(accessToken) && Boolean(doctorProfileId),
  });

  const invalidate = () =>
    queryClient
      .invalidateQueries({
        queryKey: [DOCTOR_SCHEDULE_EXCEPTIONS_QUERY_KEY, doctorProfileId],
      })
      .catch(() => undefined);

  const createMutation = useMutation({
    mutationFn: (payload: CreateScheduleExceptionInput) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createScheduleException(accessToken, doctorProfileId as string, payload);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteScheduleException(accessToken, id);
    },
    onSuccess: invalidate,
  });

  return {
    exceptions: query.data?.items ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    createMutation,
    deleteMutation,
  };
};
