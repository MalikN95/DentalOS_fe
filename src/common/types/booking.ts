import type { WorkingHours } from '@/common/types/settings';

export type BookingClinic = {
  name: string;
  logoUrl: string | null;
  currency: string;
};

export type BookingBranch = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  workingHours: WorkingHours | null;
};

export type BookingService = {
  id: string;
  name: string;
  price: string;
  durationMinutes: number;
  description: string | null;
  preparation: string | null;
};

export type BookingServiceCategory = {
  id: string | null;
  name: string | null;
  services: BookingService[];
};

export type BookingDoctor = {
  id: string;
  /** Always set — the widget derives the branch from the chosen doctor instead of asking the patient. */
  branchId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  specializations: string[];
  experienceYears: number;
  description: string | null;
  /** Only counts reviews explicitly curated for the booking widget; null when there are none yet. */
  averageRating: number | null;
  reviewCount: number;
};

export type CreateBookingPayload = {
  branchId: string;
  serviceId: string;
  doctorProfileId: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  comment?: string;
};

export type BookingConfirmation = {
  appointmentId: string;
  status: string;
  startsAt: string;
  doctorName: string;
  serviceName: string;
  branchAddress: string;
};
