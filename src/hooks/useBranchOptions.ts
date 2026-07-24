'use client';

import { useQuery } from '@tanstack/react-query';
import type { BranchSettings } from '@/common/types/settings';
import { fetchBranches } from '@/helpers/settings.api';
import { BRANCHES_QUERY_KEY } from '@/hooks/useBranchSettings';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

/** Read-only branches list for selectors; shares the cache with the settings page. */
export const useBranchOptions = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchBranches(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const branches: BranchSettings[] = query.data ?? [];

  return { branches, isLoading: query.isLoading };
};
