import type { ApiAppointment, Appointment } from '@/common/types/appointment';
import { formatTime } from '@/helpers/date';

const MS_PER_MINUTE = 60_000;

export const mapApiAppointmentToRow = (appointment: ApiAppointment): Appointment => ({
  id: appointment.id,
  time: formatTime(appointment.startsAt),
  endTime: formatTime(appointment.endsAt),
  durationMinutes: Math.round(
    (new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime()) /
      MS_PER_MINUTE,
  ),
  patientId: appointment.patient.id,
  patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim(),
  patientPhone: appointment.patient.phone ?? '—',
  doctorProfileId: appointment.doctorProfile.id,
  doctorName:
    `${appointment.doctorProfile.user.firstName} ${appointment.doctorProfile.user.lastName}`.trim(),
  cabinet: appointment.cabinet?.name ?? '—',
  service: appointment.service.name,
  price: appointment.price,
  status: appointment.status,
});
