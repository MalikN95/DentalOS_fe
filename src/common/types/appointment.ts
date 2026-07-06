export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

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
