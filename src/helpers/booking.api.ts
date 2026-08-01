import type {
  BookingBranch,
  BookingClinic,
  BookingConfirmation,
  BookingDoctor,
  BookingServiceCategory,
  CreateBookingPayload,
} from '@/common/types/booking';
import { publicApiFetch } from '@/helpers/api-fetch';

export const fetchBookingClinic = (
  clinicSlug: string,
  signal?: AbortSignal,
): Promise<BookingClinic> =>
  publicApiFetch<BookingClinic>(`/api/booking/${clinicSlug}/clinic`, { signal });

export const fetchBookingBranches = (
  clinicSlug: string,
  signal?: AbortSignal,
): Promise<BookingBranch[]> =>
  publicApiFetch<BookingBranch[]>(`/api/booking/${clinicSlug}/branches`, { signal });

export const fetchBookingServices = (
  clinicSlug: string,
  signal?: AbortSignal,
): Promise<BookingServiceCategory[]> =>
  publicApiFetch<BookingServiceCategory[]>(`/api/booking/${clinicSlug}/services`, { signal });

export const fetchBookingDoctors = (
  clinicSlug: string,
  params: { serviceId: string },
  signal?: AbortSignal,
): Promise<BookingDoctor[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<BookingDoctor[]>(`/api/booking/${clinicSlug}/doctors?${query.toString()}`, {
    signal,
  });
};

export const fetchBookingDays = (
  clinicSlug: string,
  params: { doctorProfileId: string; serviceId: string; branchId: string; month: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<string[]>(`/api/booking/${clinicSlug}/days?${query.toString()}`, { signal });
};

export const fetchBookingSlots = (
  clinicSlug: string,
  params: { doctorProfileId: string; serviceId: string; branchId: string; date: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<string[]>(`/api/booking/${clinicSlug}/slots?${query.toString()}`, { signal });
};

export const createBooking = (
  clinicSlug: string,
  payload: CreateBookingPayload,
): Promise<BookingConfirmation> =>
  publicApiFetch<BookingConfirmation>(`/api/booking/${clinicSlug}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const registerBookingPushToken = (
  clinicSlug: string,
  patientId: string,
  token: string,
): Promise<void> =>
  publicApiFetch<void>(`/api/booking/${clinicSlug}/push-subscription`, {
    method: 'POST',
    body: JSON.stringify({ patientId, token }),
  });
