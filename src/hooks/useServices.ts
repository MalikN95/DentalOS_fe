'use client';

import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteService, fetchServices } from '@/helpers/services.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const SERVICES_QUERY_KEY = 'services-management';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const useServices = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce the search input, resetting to the first page on every change.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = useQuery({
    queryKey: [SERVICES_QUERY_KEY, 'list', { page, limit, search }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchServices(accessToken, { page, limit, search }, signal);
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return deleteService(accessToken, id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
    },
  });

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return {
    query,
    services: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page,
    limit,
    searchInput,
    setSearchInput,
    setPage,
    setLimit: handleLimitChange,
    deleteMutation,
  };
};
