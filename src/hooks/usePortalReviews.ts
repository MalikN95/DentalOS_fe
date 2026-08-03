'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMyReviews } from '@/helpers/patient-portal.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PORTAL_REVIEWS_QUERY_KEY = 'portal-reviews';

export const usePortalReviews = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PORTAL_REVIEWS_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchMyReviews(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return { reviews: query.data ?? [], isLoading: query.isLoading };
};
