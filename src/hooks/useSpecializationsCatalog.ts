'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSpecializationsCatalog } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const SPECIALIZATIONS_CATALOG_QUERY_KEY = 'specializations-catalog';

export const useSpecializationsCatalog = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [SPECIALIZATIONS_CATALOG_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchSpecializationsCatalog(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return { options: query.data ?? [], isLoading: query.isLoading };
};
