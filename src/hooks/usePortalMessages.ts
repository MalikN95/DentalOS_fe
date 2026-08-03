'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMyMessages } from '@/helpers/patient-portal.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PORTAL_MESSAGES_QUERY_KEY = 'portal-messages';

const LIMIT = 100;

export const usePortalMessages = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PORTAL_MESSAGES_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchMyMessages(accessToken, { page: 1, limit: LIMIT }, signal);
    },
    enabled: Boolean(accessToken),
  });

  // API returns newest-first; the thread renders oldest-to-newest.
  const messages = [...(query.data?.items ?? [])].reverse();

  return { messages, isLoading: query.isLoading, errorMessage: query.error?.message ?? null };
};
