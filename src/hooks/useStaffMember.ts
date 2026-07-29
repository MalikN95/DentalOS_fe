'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchStaffMember } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const STAFF_MEMBER_QUERY_KEY = 'staff-member';

export const useStaffMember = (id: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [STAFF_MEMBER_QUERY_KEY, id],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchStaffMember(accessToken, id, signal);
    },
    enabled: Boolean(accessToken) && Boolean(id),
  });

  return {
    member: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
  };
};
