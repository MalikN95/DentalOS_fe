import type { PaginatedResult } from '@/common/types/pagination';
import type { ApiReview, ListReviewsParams } from '@/common/types/review';
import { apiFetch } from '@/helpers/api-fetch';

const buildListQuery = ({
  page,
  limit,
  status,
  doctorProfileId,
  patientId,
  featured,
  showInBooking,
}: ListReviewsParams): string => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (status) {
    params.set('status', status);
  }

  if (doctorProfileId) {
    params.set('doctorProfileId', doctorProfileId);
  }

  if (patientId) {
    params.set('patientId', patientId);
  }

  if (typeof featured === 'boolean') {
    params.set('featured', String(featured));
  }

  if (typeof showInBooking === 'boolean') {
    params.set('showInBooking', String(showInBooking));
  }

  return params.toString();
};

export const fetchReviews = (
  accessToken: string,
  params: ListReviewsParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiReview>> =>
  apiFetch<PaginatedResult<ApiReview>>(accessToken, `/api/reviews?${buildListQuery(params)}`, {
    signal,
  });

export const updateReviewFeatured = (
  accessToken: string,
  id: string,
  featured: boolean,
): Promise<ApiReview> =>
  apiFetch<ApiReview>(accessToken, `/api/reviews/${id}/featured`, {
    method: 'PATCH',
    body: JSON.stringify({ featured }),
  });

export const updateReviewShowInBooking = (
  accessToken: string,
  id: string,
  showInBooking: boolean,
): Promise<ApiReview> =>
  apiFetch<ApiReview>(accessToken, `/api/reviews/${id}/show-in-booking`, {
    method: 'PATCH',
    body: JSON.stringify({ showInBooking }),
  });
