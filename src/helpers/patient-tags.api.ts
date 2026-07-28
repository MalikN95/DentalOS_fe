import type {
  CreatePatientTagPayload,
  PatientTag,
  UpdatePatientTagPayload,
} from '@/common/types/patient-tag';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchPatientTags = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<PatientTag[]> => apiFetch<PatientTag[]>(accessToken, '/api/patient-tags', { signal });

export const createPatientTag = (
  accessToken: string,
  payload: CreatePatientTagPayload,
): Promise<PatientTag> =>
  apiFetch<PatientTag>(accessToken, '/api/patient-tags', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePatientTag = (
  accessToken: string,
  id: string,
  payload: UpdatePatientTagPayload,
): Promise<PatientTag> =>
  apiFetch<PatientTag>(accessToken, `/api/patient-tags/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deletePatientTag = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/patient-tags/${id}`, { method: 'DELETE' });
