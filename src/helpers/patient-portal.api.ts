import type { ApiPatientMessage } from '@/common/types/chat';
import type { PaginatedResult } from '@/common/types/pagination';
import type {
  PatientPortalAppointment,
  PatientPortalAppointmentScope,
  PatientPortalProfile,
  PatientPortalReview,
} from '@/common/types/patient-portal';
import { apiFetch, publicApiFetch } from '@/helpers/api-fetch';

type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export const requestPatientOtp = (slug: string, phone: string): Promise<void> =>
  publicApiFetch<void>(`/api/auth/${slug}/sms/request`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

export const verifyPatientOtp = (
  slug: string,
  phone: string,
  code: string,
): Promise<TokensResponse> =>
  publicApiFetch<TokensResponse>(`/api/auth/${slug}/sms/verify`, {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });

export const fetchMyPatientProfile = (accessToken: string): Promise<PatientPortalProfile> =>
  apiFetch<PatientPortalProfile>(accessToken, '/api/patient/me');

export const fetchMyAppointments = (
  accessToken: string,
  scope: PatientPortalAppointmentScope,
  signal?: AbortSignal,
): Promise<PatientPortalAppointment[]> =>
  apiFetch<PatientPortalAppointment[]>(accessToken, `/api/patient/appointments?scope=${scope}`, {
    signal,
  });

export const cancelMyAppointment = (
  accessToken: string,
  appointmentId: string,
  reason: string | undefined,
): Promise<PatientPortalAppointment> =>
  apiFetch<PatientPortalAppointment>(
    accessToken,
    `/api/patient/appointments/${appointmentId}/cancel`,
    {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    },
  );

export const fetchMyMessages = (
  accessToken: string,
  params: { page: number; limit: number },
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiPatientMessage>> =>
  apiFetch<PaginatedResult<ApiPatientMessage>>(
    accessToken,
    `/api/patient/messages?page=${params.page}&limit=${params.limit}`,
    { signal },
  );

export const sendMyMessage = (accessToken: string, body: string): Promise<ApiPatientMessage> =>
  apiFetch<ApiPatientMessage>(accessToken, '/api/patient/messages', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });

export const fetchMyReviews = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<PatientPortalReview[]> =>
  apiFetch<PatientPortalReview[]>(accessToken, '/api/patient/reviews', { signal });

export const submitMyReview = (
  accessToken: string,
  appointmentId: string,
  payload: { rating: number; comment?: string },
): Promise<PatientPortalReview> =>
  apiFetch<PatientPortalReview>(accessToken, `/api/patient/appointments/${appointmentId}/review`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
