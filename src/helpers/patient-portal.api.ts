import type {
  BookingBranch,
  BookingConfirmation,
  BookingDoctor,
  BookingServiceCategory,
} from '@/common/types/booking';
import type { ApiPatientMessage } from '@/common/types/chat';
import type { PaginatedResult } from '@/common/types/pagination';
import type {
  PatientPortalAppointment,
  PatientPortalAppointmentScope,
  PatientPortalBookingPayload,
  PatientPortalProfile,
  PatientPortalReview,
} from '@/common/types/patient-portal';
import { apiFetch, publicApiFetch } from '@/helpers/api-fetch';

type TokensResponse = {
  accessToken: string;
  refreshToken: string;
};

export const requestPatientLoginLink = (slug: string, phone: string): Promise<void> =>
  publicApiFetch<void>(`/api/auth/${slug}/sms/request`, {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

// `slug` only picks the route (`TenantGuard` needs *a* `:clinicSlug` to
// resolve) — the token itself already identifies the clinic + phone it was
// issued for, see SmsAuthService#verifyLoginLink on the backend.
export const verifyPatientMagicLink = (slug: string, token: string): Promise<TokensResponse> =>
  publicApiFetch<TokensResponse>(`/api/auth/${slug}/sms/verify`, {
    method: 'POST',
    body: JSON.stringify({ token }),
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

export const fetchMyBookingBranches = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<BookingBranch[]> =>
  apiFetch<BookingBranch[]>(accessToken, '/api/patient/booking/branches', { signal });

export const fetchMyBookingServices = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<BookingServiceCategory[]> =>
  apiFetch<BookingServiceCategory[]>(accessToken, '/api/patient/booking/services', { signal });

export const fetchMyBookingDoctors = (
  accessToken: string,
  params: { serviceId: string },
  signal?: AbortSignal,
): Promise<BookingDoctor[]> => {
  const query = new URLSearchParams(params);
  return apiFetch<BookingDoctor[]>(
    accessToken,
    `/api/patient/booking/doctors?${query.toString()}`,
    {
      signal,
    },
  );
};

export const fetchMyBookingDays = (
  accessToken: string,
  params: { doctorProfileId: string; serviceId: string; branchId: string; month: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return apiFetch<string[]>(accessToken, `/api/patient/booking/days?${query.toString()}`, {
    signal,
  });
};

export const fetchMyBookingSlots = (
  accessToken: string,
  params: { doctorProfileId: string; serviceId: string; branchId: string; date: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return apiFetch<string[]>(accessToken, `/api/patient/booking/slots?${query.toString()}`, {
    signal,
  });
};

export const createMyBooking = (
  accessToken: string,
  payload: PatientPortalBookingPayload,
): Promise<BookingConfirmation> =>
  apiFetch<BookingConfirmation>(accessToken, '/api/patient/booking', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
