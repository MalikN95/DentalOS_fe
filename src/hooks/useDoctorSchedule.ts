'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ScheduleSlotInput } from '@/common/types/schedule';
import { fetchDoctorSchedule, replaceDoctorSchedule } from '@/helpers/schedules.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const DOCTOR_SCHEDULE_QUERY_KEY = 'doctor-schedule';

export const useDoctorSchedule = (doctorProfileId: string | null | undefined) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [DOCTOR_SCHEDULE_QUERY_KEY, doctorProfileId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchDoctorSchedule(accessToken, doctorProfileId as string, signal);
    },
    enabled: Boolean(accessToken) && Boolean(doctorProfileId),
  });

  const saveMutation = useMutation({
    mutationFn: (slots: ScheduleSlotInput[]) => {
      if (!accessToken) throw new Error('Not authenticated');
      return replaceDoctorSchedule(accessToken, doctorProfileId as string, slots);
    },
    onSuccess: (slots) => {
      queryClient.setQueryData([DOCTOR_SCHEDULE_QUERY_KEY, doctorProfileId], slots);
    },
  });

  return {
    slots: query.data ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    saveMutation,
  };
};
