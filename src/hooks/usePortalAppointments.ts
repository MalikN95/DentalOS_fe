'use client';

import { useQuery } from '@tanstack/react-query';
import type { PatientPortalAppointmentScope } from '@/common/types/patient-portal';
import { fetchMyAppointments } from '@/helpers/patient-portal.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PORTAL_APPOINTMENTS_QUERY_KEY = 'portal-appointments';

export const usePortalAppointments = (scope: PatientPortalAppointmentScope) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PORTAL_APPOINTMENTS_QUERY_KEY, scope],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchMyAppointments(accessToken, scope, signal);
    },
    enabled: Boolean(accessToken),
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
