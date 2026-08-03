'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMyPatientProfile } from '@/helpers/patient-portal.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PORTAL_PROFILE_QUERY_KEY = 'portal-profile';

export const usePortalProfile = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PORTAL_PROFILE_QUERY_KEY],
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchMyPatientProfile(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  return {
    profile: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
