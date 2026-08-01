'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReviewFeatured, updateReviewShowInBooking } from '@/helpers/reviews.api';
import { REVIEWS_QUERY_KEY } from '@/hooks/useReviews';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const useUpdateReviewFeatured = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateReviewFeatured(accessToken, id, featured);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEWS_QUERY_KEY] }).catch(() => undefined);
    },
  });
};

export const useUpdateReviewShowInBooking = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, showInBooking }: { id: string; showInBooking: boolean }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateReviewShowInBooking(accessToken, id, showInBooking);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEWS_QUERY_KEY] }).catch(() => undefined);
    },
  });
};
