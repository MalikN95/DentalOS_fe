'use client';

import { useCallback, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchReviews } from '@/helpers/reviews.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const REVIEWS_QUERY_KEY = 'reviews';

const DEFAULT_LIMIT = 20;

type UseReviewsParams = {
  /** Locks the list to one patient's reviews — used by the patient card, not user-editable. */
  patientId?: string;
  /** Locks the list to one doctor's reviews — used by the staff card, not user-editable. */
  doctorProfileId?: string;
  /** Set false to skip fetching entirely, e.g. while a required id hasn't resolved yet. */
  enabled?: boolean;
  /** Starting page size — same as calling setLimit right after mount, without the extra render. */
  initialLimit?: number;
};

export const useReviews = ({
  patientId,
  doctorProfileId,
  enabled = true,
  initialLimit = DEFAULT_LIMIT,
}: UseReviewsParams = {}) => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const query = useQuery({
    queryKey: [REVIEWS_QUERY_KEY, { page, limit, patientId, doctorProfileId }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchReviews(accessToken, { page, limit, patientId, doctorProfileId }, signal);
    },
    enabled: Boolean(accessToken) && enabled,
    placeholderData: keepPreviousData,
  });

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return {
    query,
    reviews: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page,
    limit,
    setPage,
    setLimit: handleLimitChange,
  };
};
