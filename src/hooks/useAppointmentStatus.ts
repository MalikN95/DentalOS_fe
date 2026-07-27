'use client';

import { useMutation } from '@tanstack/react-query';
import type { Appointment } from '@/common/types/appointment';
import {
  updateAppointmentStatus,
  type UpdateAppointmentStatusPayload,
} from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseAppointmentStatusParams = {
  appointmentId: string;
  onSuccess?: (appointment: Appointment) => void;
};

export const useAppointmentStatus = ({ appointmentId, onSuccess }: UseAppointmentStatusParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useMutation({
    mutationFn: (payload: UpdateAppointmentStatusPayload) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return updateAppointmentStatus(accessToken, appointmentId, payload);
    },
    onSuccess,
  });
};
