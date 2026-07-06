import type { ApiAppointment, Appointment } from '@/common/types/appointment';
import { formatTime } from '@/helpers/date';

export const mapApiAppointmentToRow = (appointment: ApiAppointment): Appointment => ({
  id: appointment.id,
  time: formatTime(appointment.startsAt),
  patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim(),
  patientPhone: appointment.patient.phone ?? '—',
  doctorName:
    `${appointment.doctorProfile.user.firstName} ${appointment.doctorProfile.user.lastName}`.trim(),
  cabinet: appointment.cabinet?.name ?? '—',
  service: appointment.service.name,
  status: appointment.status,
});
