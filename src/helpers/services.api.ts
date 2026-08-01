import type { PaginatedResult } from '@/common/types/pagination';
import type {
  ApiService,
  CreateServicePayload,
  ListServicesParams,
  ServiceCategoryOption,
  UpdateServicePayload,
} from '@/common/types/service';
import { apiFetch } from '@/helpers/api-fetch';

const buildListQuery = ({ page, limit, categoryId, search }: ListServicesParams): string => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (categoryId) {
    params.set('categoryId', categoryId);
  }

  const trimmed = search?.trim();
  if (trimmed) {
    params.set('search', trimmed);
  }

  return params.toString();
};

export const fetchServices = (
  accessToken: string,
  params: ListServicesParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiService>> =>
  apiFetch<PaginatedResult<ApiService>>(accessToken, `/api/services?${buildListQuery(params)}`, {
    signal,
  });

export const fetchServiceCategoryOptions = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<ServiceCategoryOption[]> =>
  apiFetch<PaginatedResult<ServiceCategoryOption>>(
    accessToken,
    '/api/service-categories?page=1&limit=200',
    { signal },
  ).then((result) => result.items);

export const createService = (
  accessToken: string,
  payload: CreateServicePayload,
): Promise<ApiService> =>
  apiFetch<ApiService>(accessToken, '/api/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateService = (
  accessToken: string,
  id: string,
  payload: UpdateServicePayload,
): Promise<ApiService> =>
  apiFetch<ApiService>(accessToken, `/api/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteService = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/services/${id}`, { method: 'DELETE' });
