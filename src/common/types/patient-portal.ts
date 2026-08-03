import type { AppointmentStatus } from '@/common/types/appointment';

export type PatientPortalProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
};

export type PatientPortalAppointmentScope = 'upcoming' | 'past';

export type PatientPortalAppointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  serviceName: string;
  doctorName: string;
  branchName: string;
  price: string;
  comment: string | null;
  cancellationReason: string | null;
  isCancellable: boolean;
};

export type PatientPortalReview = {
  id: string;
  appointmentId: string;
  rating: number;
  comment: string | null;
};
