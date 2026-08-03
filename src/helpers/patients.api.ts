import type { PaginatedResult } from '@/common/types/pagination';
import type {
  CreatePatientPayload,
  ListPatientsParams,
  Patient,
  UpdatePatientPayload,
} from '@/common/types/patient';
import type { ApiPatientNote } from '@/common/types/patient-note';
import type { ApiMedicalRecord, ApiVisit } from '@/common/types/visit';
import { apiFetch } from '@/helpers/api-fetch';

const buildListQuery = ({
  page,
  limit,
  search,
  isActive,
  createdFrom,
  createdTo,
  tagIds,
}: ListPatientsParams): string => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const trimmed = search?.trim();
  if (trimmed) {
    params.set('search', trimmed);
  }

  if (typeof isActive === 'boolean') {
    params.set('isActive', String(isActive));
  }

  if (createdFrom) {
    params.set('createdFrom', createdFrom);
  }

  if (createdTo) {
    params.set('createdTo', createdTo);
  }

  if (tagIds && tagIds.length > 0) {
    params.set('tagIds', tagIds.join(','));
  }

  return params.toString();
};

export const fetchPatients = (
  accessToken: string,
  params: ListPatientsParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<Patient>> =>
  apiFetch<PaginatedResult<Patient>>(accessToken, `/api/patients?${buildListQuery(params)}`, {
    signal,
  });

export const createPatient = (
  accessToken: string,
  payload: CreatePatientPayload,
): Promise<Patient> =>
  apiFetch<Patient>(accessToken, '/api/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updatePatient = (
  accessToken: string,
  id: string,
  payload: UpdatePatientPayload,
): Promise<Patient> =>
  apiFetch<Patient>(accessToken, `/api/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const fetchPatient = (
  accessToken: string,
  id: string,
  signal?: AbortSignal,
): Promise<Patient> => apiFetch<Patient>(accessToken, `/api/patients/${id}`, { signal });

// Dev/QA only — code is null in any real deployment (see backend README).
export const fetchPatientDevLoginCode = (
  accessToken: string,
  id: string,
  signal?: AbortSignal,
): Promise<{ code: string | null }> =>
  apiFetch<{ code: string | null }>(accessToken, `/api/patients/${id}/dev-login-code`, { signal });

export const fetchAllergiesCatalog = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<string[]> =>
  apiFetch<string[]>(accessToken, '/api/patients/catalog/allergies', { signal });

export const fetchChronicDiseasesCatalog = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<string[]> =>
  apiFetch<string[]>(accessToken, '/api/patients/catalog/chronic-diseases', { signal });

export const fetchPatientHistory = (
  accessToken: string,
  id: string,
  limit = 100,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiVisit>> =>
  apiFetch<PaginatedResult<ApiVisit>>(
    accessToken,
    `/api/patients/${id}/history?page=1&limit=${limit}`,
    { signal },
  );

export const assignPatientTag = (
  accessToken: string,
  patientId: string,
  tagId: string,
): Promise<Patient> =>
  apiFetch<Patient>(accessToken, `/api/patients/${patientId}/tags/${tagId}`, {
    method: 'POST',
  });

export const unassignPatientTag = (
  accessToken: string,
  patientId: string,
  tagId: string,
): Promise<Patient> =>
  apiFetch<Patient>(accessToken, `/api/patients/${patientId}/tags/${tagId}`, {
    method: 'DELETE',
  });

export const fetchPatientNotes = (
  accessToken: string,
  patientId: string,
  signal?: AbortSignal,
): Promise<ApiPatientNote[]> =>
  apiFetch<ApiPatientNote[]>(accessToken, `/api/patients/${patientId}/notes`, { signal });

export const createPatientNote = (
  accessToken: string,
  patientId: string,
  text: string,
): Promise<ApiPatientNote> =>
  apiFetch<ApiPatientNote>(accessToken, `/api/patients/${patientId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

export const fetchPatientMedicalRecords = (
  accessToken: string,
  id: string,
  limit = 100,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiMedicalRecord>> =>
  apiFetch<PaginatedResult<ApiMedicalRecord>>(
    accessToken,
    `/api/medical-records?patientId=${id}&page=1&limit=${limit}`,
    { signal },
  );
