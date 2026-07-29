import type { PaginatedResult } from '@/common/types/pagination';
import type { ApiServiceOption } from '@/common/types/service';
import type {
  ApiTreatmentPlan,
  ApiTreatmentPlanDoctorProfile,
  CreateTreatmentPlanPayload,
  ListTreatmentPlansParams,
  ReplaceTreatmentPlanItemsPayload,
  TreatmentPlanFormOptions,
  TreatmentPlanItemStatus,
  UpdateTreatmentPlanPayload,
} from '@/common/types/treatment-plan';
import { apiFetch } from '@/helpers/api-fetch';

const LIST_QUERY = 'page=1&limit=200';

export const fetchTreatmentPlans = (
  accessToken: string,
  { page, limit, patientId, createdFrom, createdTo }: ListTreatmentPlansParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiTreatmentPlan>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (patientId) params.set('patientId', patientId);
  if (createdFrom) params.set('createdFrom', createdFrom);
  if (createdTo) params.set('createdTo', createdTo);

  return apiFetch<PaginatedResult<ApiTreatmentPlan>>(
    accessToken,
    `/api/treatment-plans?${params.toString()}`,
    { signal },
  );
};

export const fetchTreatmentPlan = (
  accessToken: string,
  id: string,
  signal?: AbortSignal,
): Promise<ApiTreatmentPlan> =>
  apiFetch<ApiTreatmentPlan>(accessToken, `/api/treatment-plans/${id}`, { signal });

export const fetchServiceOptions = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<ApiServiceOption[]> => {
  const services = await apiFetch<PaginatedResult<ApiServiceOption>>(
    accessToken,
    `/api/services?${LIST_QUERY}`,
    { signal },
  );

  return services.items;
};

export type CreateServiceOptionPayload = {
  name: string;
  price: string;
  durationMinutes: number;
};

export const createServiceOption = (
  accessToken: string,
  payload: CreateServiceOptionPayload,
): Promise<ApiServiceOption> =>
  apiFetch<ApiServiceOption>(accessToken, '/api/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const fetchTreatmentPlanFormOptions = async (
  accessToken: string,
  signal?: AbortSignal,
): Promise<TreatmentPlanFormOptions> => {
  const [services, doctors] = await Promise.all([
    fetchServiceOptions(accessToken, signal),
    apiFetch<PaginatedResult<ApiTreatmentPlanDoctorProfile>>(
      accessToken,
      `/api/doctors?${LIST_QUERY}`,
      { signal },
    ),
  ]);

  return { services, doctors: doctors.items };
};

export const createTreatmentPlan = (
  accessToken: string,
  payload: CreateTreatmentPlanPayload,
): Promise<ApiTreatmentPlan> =>
  apiFetch<ApiTreatmentPlan>(accessToken, '/api/treatment-plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateTreatmentPlan = (
  accessToken: string,
  id: string,
  payload: UpdateTreatmentPlanPayload,
): Promise<ApiTreatmentPlan> =>
  apiFetch<ApiTreatmentPlan>(accessToken, `/api/treatment-plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const replaceTreatmentPlanItems = (
  accessToken: string,
  id: string,
  payload: ReplaceTreatmentPlanItemsPayload,
): Promise<ApiTreatmentPlan> =>
  apiFetch<ApiTreatmentPlan>(accessToken, `/api/treatment-plans/${id}/items`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

export const updateTreatmentPlanItemStatus = (
  accessToken: string,
  itemId: string,
  status: TreatmentPlanItemStatus,
): Promise<void> =>
  apiFetch(accessToken, `/api/treatment-plans/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteTreatmentPlan = (accessToken: string, id: string): Promise<void> =>
  apiFetch(accessToken, `/api/treatment-plans/${id}`, { method: 'DELETE' });
