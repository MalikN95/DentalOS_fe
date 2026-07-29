import type { Appointment } from '@/common/types/appointment';

// Typical clinic working window shown even when a hour has no appointments —
// extended to fit any booking that falls outside it (early/late bookings
// still get their own row instead of being clipped off the grid).
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 20;

export const getAppointmentHour = (appointment: Appointment): number =>
  Number(appointment.time.split(':')[0]);

export const groupAppointmentsByHour = (appointments: Appointment[]): Map<number, Appointment[]> => {
  const grouped = new Map<number, Appointment[]>();

  appointments.forEach((appointment) => {
    const hour = getAppointmentHour(appointment);
    grouped.set(hour, [...(grouped.get(hour) ?? []), appointment]);
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

// Minutes elapsed between an appointment's "HH:MM" time (on the given day)
// and `now` — negative when the appointment hasn't started yet.
export const getMinutesLate = (time: string, date: Date, now: Date): number => {
  const [hours, minutes] = time.split(':').map(Number);
  const startsAt = new Date(date);
  startsAt.setHours(hours, minutes, 0, 0);
  return (now.getTime() - startsAt.getTime()) / 60_000;
};
