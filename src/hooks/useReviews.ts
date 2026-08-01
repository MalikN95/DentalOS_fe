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
};

export const useReviews = ({ patientId, doctorProfileId }: UseReviewsParams = {}) => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  const query = useQuery({
    queryKey: [REVIEWS_QUERY_KEY, { page, limit, patientId, doctorProfileId }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchReviews(accessToken, { page, limit, patientId, doctorProfileId }, signal);
    },
    enabled: Boolean(accessToken),
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
