'use client';

import { useCallback, useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { StaffFilter, StaffRole } from '@/common/types/staff';
import { fetchStaff } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const STAFF_QUERY_KEY = 'staff';

const DEFAULT_LIMIT = 20;
const SEARCH_DEBOUNCE_MS = 350;

const filterToIsActive = (filter: StaffFilter): boolean | undefined => {
  if (filter === 'active') return true;
  if (filter === 'inactive') return false;
  return undefined;
};

export const useStaff = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StaffFilter>('all');
  const [role, setRole] = useState<StaffRole | null>(null);

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
    queryKey: [STAFF_QUERY_KEY, 'list', { page, limit, search, isActive, role }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchStaff(
        accessToken,
        { page, limit, search, isActive, role: role ?? undefined },
        signal,
      );
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const handleFilterChange = useCallback((next: StaffFilter) => {
    setFilter(next);
    setPage(1);
  }, []);

  const handleRoleChange = useCallback((next: StaffRole | null) => {
    setRole(next);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return {
    query,
    staff: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page,
    limit,
    filter,
    role,
    searchInput,
    setSearchInput,
    setPage,
    setLimit: handleLimitChange,
    setFilter: handleFilterChange,
    setRole: handleRoleChange,
  };
};
