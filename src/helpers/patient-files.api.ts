import type {
  ApiPatientFile,
  PatientFilesPage,
  PatientFileType,
} from '@/common/types/patient-file';
import { apiFetch } from '@/helpers/api-fetch';

type RequestUploadPayload = {
  fileName: string;
  contentType: string;
  type: PatientFileType;
};

type UploadTarget = {
  uploadUrl: string;
  key: string;
};

export const requestPatientFileUpload = (
  accessToken: string,
  patientId: string,
  payload: RequestUploadPayload,
): Promise<UploadTarget> =>
  apiFetch<UploadTarget>(accessToken, `/api/patients/${patientId}/files/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const uploadFileToUrl = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }
};

type ConfirmUploadPayload = {
  key: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  type: PatientFileType;
  toothNumber?: number;
};

export const confirmPatientFileUpload = (
  accessToken: string,
  patientId: string,
  payload: ConfirmUploadPayload,
): Promise<ApiPatientFile> =>
  apiFetch<ApiPatientFile>(accessToken, `/api/patients/${patientId}/files`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

type FetchPatientFilesParams = {
  toothNumber?: number;
  type?: PatientFileType;
  page?: number;
  limit?: number;
};

export const fetchPatientFiles = (
  accessToken: string,
  patientId: string,
  params: FetchPatientFilesParams,
  signal?: AbortSignal,
): Promise<PatientFilesPage> => {
  const query = new URLSearchParams();
  if (params.toothNumber !== undefined) query.set('toothNumber', String(params.toothNumber));
  if (params.type) query.set('type', params.type);
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 50));

  return apiFetch<PatientFilesPage>(accessToken, `/api/patients/${patientId}/files?${query}`, {
    signal,
  });
};

export const deletePatientFile = (accessToken: string, fileId: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/patients/files/${fileId}`, { method: 'DELETE' });
