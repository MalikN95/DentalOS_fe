export type AppointmentStatus =
  'pending' | 'confirmed' | 'arrived' | 'in_treatment' | 'completed' | 'cancelled' | 'no_show';

export type Appointment = {
  id: string;
  time: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  cabinet: string;
  service: string;
  status: AppointmentStatus;
};

export type ApiAppointmentPatient = {
  firstName: string;
  lastName: string;
  phone: string | null;
};

export type ApiAppointmentDoctorUser = {
  firstName: string;
  lastName: string;
};

export type ApiAppointmentDoctorProfile = {
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
  patient: ApiAppointmentPatient;
  doctorProfile: ApiAppointmentDoctorProfile;
  service: ApiAppointmentService;
  cabinet: ApiAppointmentCabinet | null;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
};

export type ScheduleSlot = {
  id: string;
  time: string;
  patientName: string;
  service: string;
  doctorName: string;
  color: 'primary' | 'success' | 'danger' | 'gray';
};
