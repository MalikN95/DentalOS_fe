'use client';

import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPatientConversations } from '@/helpers/chat.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_CONVERSATIONS_QUERY_KEY = 'patient-conversations';

const PAGE_SIZE = 20;

export const usePatientConversations = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const query = useQuery({
    queryKey: [PATIENT_CONVERSATIONS_QUERY_KEY, { limit }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPatientConversations(accessToken, { page: 1, limit }, signal);
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const conversations = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const hasMore = conversations.length < total;

  return {
    conversations,
    hasMore,
    isLoading: query.isLoading,
    loadMore: () => setLimit((current) => current + PAGE_SIZE),
  };
};
