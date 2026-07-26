import type { Appointment, AppointmentStatus } from '@/common/types/appointment';
import type { BadgeColor } from '@/components/ui';

// Labels live in the locale dictionary (t.appointmentStatus); only colors here.
export const appointmentStatusColor: Record<AppointmentStatus, BadgeColor> = {
  pending: 'primary',
  confirmed: 'primary',
  arrived: 'gray',
  in_treatment: 'gray',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'danger',
};

const NOT_STARTED_STATUSES: AppointmentStatus[] = ['pending', 'confirmed'];

// Appointments arrive sorted by time; the next one is the first that hasn't
// started yet (arrived/in_treatment/completed/cancelled/no_show are already past).
export const findNextAppointmentId = (appointments: Appointment[]): string | null =>
  appointments.find((appointment) => NOT_STARTED_STATUSES.includes(appointment.status))?.id ??
  null;

const NOT_FINISHED_STATUSES: AppointmentStatus[] = [
  'pending',
  'confirmed',
  'arrived',
  'in_treatment',
];

// Index of the first appointment that hasn't wrapped up yet (completed/cancelled/
// no_show are done); used to draw a section divider above the upcoming ones.
export const findFirstUpcomingIndex = (appointments: Appointment[]): number =>
  appointments.findIndex((appointment) => NOT_FINISHED_STATUSES.includes(appointment.status));

export const formatMoney = (value: string): string => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `${value} ₽`;
  return `${amount.toLocaleString('ru-RU')} ₽`;
};
