import type { RevenueAnalytics } from '@/common/types/analytics';
import { apiFetch } from '@/helpers/api-fetch';

type FetchRevenueParams = {
  accessToken: string;
  from: string;
  to: string;
  signal?: AbortSignal;
};

export const fetchRevenue = ({
  accessToken,
  from,
  to,
  signal,
}: FetchRevenueParams): Promise<RevenueAnalytics> => {
  const query = new URLSearchParams({ from, to });
  return apiFetch<RevenueAnalytics>(accessToken, `/api/analytics/revenue?${query.toString()}`, {
    signal,
  });
};
