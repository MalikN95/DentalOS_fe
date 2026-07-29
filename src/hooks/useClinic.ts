'use client';

import { useQuery } from '@tanstack/react-query';
import { CLINIC_SETTINGS_QUERY_KEY } from '@/hooks/useClinicSettings';
import { fetchClinicSettings } from '@/helpers/settings.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

// Lightweight read of the current clinic (name, logoUrl) for chrome that
// isn't the settings form — TopNav, etc. Shares the settings-form
// query key so both stay in sync off a single cached fetch.
export const useClinic = () => {
  const accessToken = useAppSelector(selectAccessToken);

  return useQuery({
    queryKey: CLINIC_SETTINGS_QUERY_KEY,
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchClinicSettings(accessToken);
    },
    enabled: Boolean(accessToken),
  });
};
