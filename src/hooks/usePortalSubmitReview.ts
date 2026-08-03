'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitMyReview } from '@/helpers/patient-portal.api';
import { PORTAL_REVIEWS_QUERY_KEY } from '@/hooks/usePortalReviews';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePortalSubmitReview = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      rating,
      comment,
    }: {
      appointmentId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return submitMyReview(accessToken, appointmentId, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PORTAL_REVIEWS_QUERY_KEY] }).catch(() => undefined);
    },
  });
};
