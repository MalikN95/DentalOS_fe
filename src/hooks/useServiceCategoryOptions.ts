'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchServiceCategoryOptions } from '@/helpers/services.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const SERVICE_CATEGORY_OPTIONS_QUERY_KEY = ['services', 'categories'];

/** Read-only service categories list, for the category dropdown in the service editor. */
export const useServiceCategoryOptions = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: SERVICE_CATEGORY_OPTIONS_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchServiceCategoryOptions(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return { categories: query.data ?? [], isLoading: query.isLoading };
};
