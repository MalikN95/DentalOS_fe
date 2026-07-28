import type { SendPatientEmailPayload } from '@/common/types/email';
import { apiFetch } from '@/helpers/api-fetch';

export const sendPatientEmail = (
  accessToken: string,
  patientId: string,
  payload: SendPatientEmailPayload,
): Promise<void> =>
  apiFetch<void>(accessToken, `/api/patients/${patientId}/emails`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
