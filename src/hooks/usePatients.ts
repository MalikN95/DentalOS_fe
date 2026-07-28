'use client';

import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PatientsFilter } from '@/common/types/patient';
import { fetchPatients } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENTS_QUERY_KEY = 'patients';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

const filterToIsActive = (filter: PatientsFilter): boolean | undefined => {
  if (filter === 'active') return true;
  if (filter === 'inactive') return false;
  return undefined;
};

export const usePatients = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PatientsFilter>('all');
  const [tagIds, setTagIdsState] = useState<string[]>([]);

  // Debounce the search input, resetting to the first page on every change.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const isActive = filterToIsActive(filter);

  const query = useQuery({
    queryKey: [PATIENTS_QUERY_KEY, 'list', { page, limit, search, isActive, tagIds }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchPatients(accessToken, { page, limit, search, isActive, tagIds }, signal);
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;

  const handleFilterChange = useCallback((next: PatientsFilter) => {
    setFilter(next);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  const handleTagIdsChange = useCallback((next: string[]) => {
    setTagIdsState(next);
    setPage(1);
  }, []);

  return {
    query,
    patients: query.data?.items ?? [],
    total,
    page,
    limit,
    filter,
    tagIds,
    searchInput,
    setSearchInput,
    setPage,
    setLimit: handleLimitChange,
    setFilter: handleFilterChange,
    setTagIds: handleTagIdsChange,
  };
};
