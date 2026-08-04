import type { PaginatedResult } from '@/common/types/pagination';
import type {
  CreateClinicPayload,
  ListPlatformClinicsParams,
  PlatformClinicDetail,
  PlatformClinicsGrowthPoint,
  PlatformClinicSummary,
  PlatformOverviewStats,
  PlatformRevenuePoint,
  UpdateClinicPayload,
} from '@/common/types/platform-admin';
import { apiFetch } from '@/helpers/api-fetch';

const buildListQuery = ({ page, limit, search, isActive }: ListPlatformClinicsParams): string => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const trimmed = search?.trim();
  if (trimmed) {
    params.set('search', trimmed);
  }

  if (typeof isActive === 'boolean') {
    params.set('isActive', String(isActive));
  }

  return params.toString();
};

export const fetchPlatformClinics = (
  accessToken: string,
  params: ListPlatformClinicsParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<PlatformClinicSummary>> =>
  apiFetch<PaginatedResult<PlatformClinicSummary>>(
    accessToken,
    `/api/platform/clinics?${buildListQuery(params)}`,
    { signal },
  );

export const fetchPlatformClinic = (
  accessToken: string,
  id: string,
  signal?: AbortSignal,
): Promise<PlatformClinicDetail> =>
  apiFetch<PlatformClinicDetail>(accessToken, `/api/platform/clinics/${id}`, { signal });

export const createPlatformClinic = (
  accessToken: string,
  payload: CreateClinicPayload,
): Promise<PlatformClinicDetail> =>
  apiFetch<PlatformClinicDetail>(accessToken, '/api/platform/clinics', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePlatformClinic = (
  accessToken: string,
  id: string,
  payload: UpdateClinicPayload,
): Promise<PlatformClinicDetail> =>
  apiFetch<PlatformClinicDetail>(accessToken, `/api/platform/clinics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deletePlatformClinic = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/platform/clinics/${id}`, { method: 'DELETE' });

export const fetchPlatformOverview = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<PlatformOverviewStats> =>
  apiFetch<PlatformOverviewStats>(accessToken, '/api/platform/stats/overview', { signal });

export const fetchPlatformRevenueByMonth = (
  accessToken: string,
  months: number,
  signal?: AbortSignal,
): Promise<PlatformRevenuePoint[]> =>
  apiFetch<PlatformRevenuePoint[]>(
    accessToken,
    `/api/platform/stats/revenue-by-month?months=${months}`,
    { signal },
  );

export const fetchPlatformClinicsGrowth = (
  accessToken: string,
  months: number,
  signal?: AbortSignal,
): Promise<PlatformClinicsGrowthPoint[]> =>
  apiFetch<PlatformClinicsGrowthPoint[]>(
    accessToken,
    `/api/platform/stats/clinics-growth?months=${months}`,
    { signal },
  );
