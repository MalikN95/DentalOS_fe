'use client';

import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPlatformClinics } from '@/helpers/platform-admin.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PLATFORM_CLINICS_QUERY_KEY = 'platform-clinics';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

export const usePlatformClinics = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const query = useQuery({
    queryKey: [PLATFORM_CLINICS_QUERY_KEY, 'list', { page, limit, search }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPlatformClinics(accessToken, { page, limit, search }, signal);
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return {
    query,
    clinics: query.data?.items ?? [],
    total,
    page,
    limit,
    searchInput,
    setSearchInput,
    setPage,
    setLimit: handleLimitChange,
  };
};
