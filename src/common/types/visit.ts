import type { AppointmentStatus } from '@/common/types/appointment';

export type ApiVisitDoctorProfile = {
  user: { firstName: string; lastName: string };
} | null;

// Appointment as returned by GET /patients/:id/history
export type ApiVisit = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  price: string;
  comment: string | null;
  service: { name: string } | null;
  branch: { name: string } | null;
  cabinet: { name: string } | null;
  doctorProfile: ApiVisitDoctorProfile;
};

// Medical record as returned by GET /medical-records?patientId
export type ApiMedicalRecord = {
  id: string;
  appointmentId: string | null;
  complaints: string | null;
  examination: string | null;
  diagnosis: string;
  treatment: string | null;
  prescriptions: string | null;
  recommendations: string | null;
  notes: string | null;
  createdAt: string;
  doctorProfile: ApiVisitDoctorProfile;
};

// Flattened visit merged with its clinical record for the UI
export type Visit = {
  id: string;
  startsAt: string;
  status: AppointmentStatus;
  price: string;
  serviceName: string;
  doctorName: string;
  cabinetName: string | null;
  branchName: string | null;
  comment: string | null;
  record: ApiMedicalRecord | null;
};
