export type AppointmentStatus =
  'pending' | 'confirmed' | 'arrived' | 'in_treatment' | 'completed' | 'cancelled' | 'no_show';

export type Appointment = {
  id: string;
  time: string;
  endTime: string;
  durationMinutes: number;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorProfileId: string;
  doctorName: string;
  cabinet: string;
  service: string;
  price: string;
  status: AppointmentStatus;
};

export type ApiAppointmentPatient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type ApiAppointmentDoctorUser = {
  firstName: string;
  lastName: string;
};

export type ApiAppointmentDoctorProfile = {
  id: string;
  user: ApiAppointmentDoctorUser;
};

export type ApiAppointmentService = {
  name: string;
};

export type ApiAppointmentCabinet = {
  name: string;
};

export type ApiAppointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  price: string;
  patient: ApiAppointmentPatient;
  doctorProfile: ApiAppointmentDoctorProfile;
  service: ApiAppointmentService;
  cabinet: ApiAppointmentCabinet | null;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
};
