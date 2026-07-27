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

export type AppointmentStatusAction = 'confirm' | 'arrive' | 'no_show' | 'start' | 'complete' | 'cancel';

// Which actions are offered next for a given current status.
export const appointmentStatusActions: Record<AppointmentStatus, AppointmentStatusAction[]> = {
  pending: ['confirm', 'arrive', 'no_show', 'cancel'],
  confirmed: ['arrive', 'no_show', 'cancel'],
  arrived: ['start', 'cancel'],
  in_treatment: ['complete', 'cancel'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const actionTargetStatus: Record<AppointmentStatusAction, AppointmentStatus> = {
  confirm: 'confirmed',
  arrive: 'arrived',
  no_show: 'no_show',
  start: 'in_treatment',
  complete: 'completed',
  cancel: 'cancelled',
};

const TERMINAL_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'no_show'];

export const isTerminalStatus = (status: AppointmentStatus): boolean =>
  TERMINAL_STATUSES.includes(status);

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

export const formatMoney = (value: string, currency = 'RUB'): string => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;

  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Unknown/invalid ISO currency code — fall back rather than throw.
    return `${amount.toLocaleString('ru-RU')} ${currency}`;
  }
};
