import type { Appointment, AppointmentStatus } from '@/common/types/appointment';

// Typical clinic working window shown even when a hour has no appointments —
// extended to fit any booking that falls outside it (early/late bookings
// still get their own row instead of being clipped off the grid).
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

export const getAppointmentHour = (appointment: Appointment): number =>
  Number(appointment.time.split(':')[0]);

export const groupAppointmentsByHour = (
  appointments: Appointment[],
): Map<number, Appointment[]> => {
  const grouped = new Map<number, Appointment[]>();

  appointments.forEach((appointment) => {
    const hour = getAppointmentHour(appointment);
    grouped.set(hour, [...(grouped.get(hour) ?? []), appointment]);
  });

  return grouped;
};

// Keyed by the appointment's 'YYYY-MM-DD' `date` field — used by the week/month/year views to bucket a range's flat appointment list back into per-day groups.
export const groupAppointmentsByDate = (
  appointments: Appointment[],
): Map<string, Appointment[]> => {
  const grouped = new Map<string, Appointment[]>();

  appointments.forEach((appointment) => {
    grouped.set(appointment.date, [...(grouped.get(appointment.date) ?? []), appointment]);
  });

  return grouped;
};

export const getBoardHourRange = (appointments: Appointment[]): number[] => {
  const hours = appointments.map(getAppointmentHour);
  const start = Math.min(DAY_START_HOUR, ...hours);
  const end = Math.max(DAY_END_HOUR, ...hours);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export const formatHourLabel = (hour: number): string => `${String(hour).padStart(2, '0')}:00`;

const ARRIVED_STATUSES = new Set<AppointmentStatus>(['arrived', 'in_treatment', 'completed']);
const CANCELLED_STATUSES = new Set<AppointmentStatus>(['cancelled', 'no_show']);
const PENDING_STATUSES = new Set<AppointmentStatus>(['pending', 'confirmed']);

export type AppointmentOutcomeSummary = {
  /** Actually showed up: arrived, in treatment, or completed. */
  arrived: number;
  /** Didn't happen: cancelled or no-show. */
  cancelled: number;
  /** Hasn't happened yet: pending or confirmed. */
  pending: number;
};

// Used by the Month view's per-day pills — a day with 20 appointments is
// more useful summarized as "how many showed up / fell through / are still
// upcoming" than as one bare total.
export const summarizeAppointmentsByOutcome = (
  appointments: Appointment[],
): AppointmentOutcomeSummary => {
  const summary: AppointmentOutcomeSummary = { arrived: 0, cancelled: 0, pending: 0 };

  appointments.forEach((appointment) => {
    if (ARRIVED_STATUSES.has(appointment.status)) {
      summary.arrived += 1;
    } else if (CANCELLED_STATUSES.has(appointment.status)) {
      summary.cancelled += 1;
    } else if (PENDING_STATUSES.has(appointment.status)) {
      summary.pending += 1;
    }
  });

  return summary;
};

// Minutes elapsed between an appointment's "HH:MM" time (on the given day)
// and `now` — negative when the appointment hasn't started yet.
export const getMinutesLate = (time: string, date: Date, now: Date): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const startsAt = new Date(date);
  startsAt.setHours(hours, minutes, 0, 0);
  return (now.getTime() - startsAt.getTime()) / 60_000;
};
