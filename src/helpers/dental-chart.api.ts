import type { ApiToothState, CreateToothMarkPayload } from '@/common/types/dental-chart';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchDentalChart = (
  accessToken: string,
  patientId: string,
  signal?: AbortSignal,
): Promise<ApiToothState[]> =>
  apiFetch<ApiToothState[]>(accessToken, `/api/dental-chart/${patientId}`, { signal });

export const addToothMark = (
  accessToken: string,
  patientId: string,
  payload: CreateToothMarkPayload,
): Promise<unknown> =>
  apiFetch<unknown>(accessToken, `/api/dental-chart/${patientId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
