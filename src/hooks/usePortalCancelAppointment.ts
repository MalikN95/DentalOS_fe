'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelMyAppointment } from '@/helpers/patient-portal.api';
import { PORTAL_APPOINTMENTS_QUERY_KEY } from '@/hooks/usePortalAppointments';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePortalCancelAppointment = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, reason }: { appointmentId: string; reason?: string }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return cancelMyAppointment(accessToken, appointmentId, reason);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [PORTAL_APPOINTMENTS_QUERY_KEY] })
        .catch(() => undefined);
    },
  });
};
