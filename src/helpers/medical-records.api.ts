import type { ApiMedicalRecord } from '@/common/types/visit';
import { apiFetch } from '@/helpers/api-fetch';

export type MedicalRecordFormPayload = {
  complaints?: string;
  examination?: string;
  diagnosis: string;
  treatment?: string;
  prescriptions?: string;
  recommendations?: string;
  notes?: string;
};

export type CreateMedicalRecordPayload = MedicalRecordFormPayload & {
  patientId: string;
  appointmentId?: string;
  doctorProfileId?: string;
};

export const createMedicalRecord = (
  accessToken: string,
  payload: CreateMedicalRecordPayload,
): Promise<ApiMedicalRecord> =>
  apiFetch<ApiMedicalRecord>(accessToken, '/api/medical-records', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateMedicalRecord = (
  accessToken: string,
  id: string,
  payload: MedicalRecordFormPayload,
): Promise<ApiMedicalRecord> =>
  apiFetch<ApiMedicalRecord>(accessToken, `/api/medical-records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
