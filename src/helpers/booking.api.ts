import type {
  BookingBranch,
  BookingClinic,
  BookingConfirmation,
  BookingDoctor,
  BookingServiceCategory,
  CreateBookingPayload,
} from '@/common/types/booking';
import { publicApiFetch } from '@/helpers/api-fetch';

export const fetchBookingClinic = (signal?: AbortSignal): Promise<BookingClinic> =>
  publicApiFetch<BookingClinic>('/api/booking/clinic', { signal });

export const fetchBookingBranches = (signal?: AbortSignal): Promise<BookingBranch[]> =>
  publicApiFetch<BookingBranch[]>('/api/booking/branches', { signal });

export const fetchBookingServices = (signal?: AbortSignal): Promise<BookingServiceCategory[]> =>
  publicApiFetch<BookingServiceCategory[]>('/api/booking/services', { signal });

export const fetchBookingDoctors = (
  params: { serviceId: string },
  signal?: AbortSignal,
): Promise<BookingDoctor[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<BookingDoctor[]>(`/api/booking/doctors?${query.toString()}`, { signal });
};

export const fetchBookingDays = (
  params: { doctorProfileId: string; serviceId: string; branchId: string; month: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<string[]>(`/api/booking/days?${query.toString()}`, { signal });
};

export const fetchBookingSlots = (
  params: { doctorProfileId: string; serviceId: string; branchId: string; date: string },
  signal?: AbortSignal,
): Promise<string[]> => {
  const query = new URLSearchParams(params);
  return publicApiFetch<string[]>(`/api/booking/slots?${query.toString()}`, { signal });
};

export const createBooking = (payload: CreateBookingPayload): Promise<BookingConfirmation> =>
  publicApiFetch<BookingConfirmation>('/api/booking', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
