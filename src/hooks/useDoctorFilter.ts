'use client';

import { useMemo, useState } from 'react';
import type { Appointment } from '@/common/types/appointment';
import type { BoardDoctorOption } from '@/components/dashboard/AppointmentsBoard/AppointmentsBoardSidebar';

const getBoardDoctors = (appointments: Appointment[]): BoardDoctorOption[] => {
  const byId = new Map<string, string>();
  appointments.forEach((appointment) => {
    if (!byId.has(appointment.doctorProfileId)) {
      byId.set(appointment.doctorProfileId, appointment.doctorName);
    }
  });
  return Array.from(byId, ([id, name]) => ({ id, name }));
};

// Shared by every calendar view (Day/Week/Month/Year) — derives the doctor
// checklist from whatever appointments that view is showing and filters
// down to the selected ones.
export const useDoctorFilter = (appointments: Appointment[]) => {
  const doctors = useMemo(() => getBoardDoctors(appointments), [appointments]);
  const doctorIdsKey = useMemo(
    () =>
      doctors
        .map((doctor) => doctor.id)
        .sort()
        .join(','),
    [doctors],
  );

  // Every doctor with an appointment in view is visible by default;
  // re-derived whenever the set of doctors actually changes (e.g. switching
  // dates/views), not on every appointments refetch. Reset-on-prop-change
  // during render (React's documented pattern), not an effect, so switching
  // doesn't render once with the stale selection before catching up.
  const [prevDoctorIdsKey, setPrevDoctorIdsKey] = useState(doctorIdsKey);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<Set<string>>(
    () => new Set(doctorIdsKey ? doctorIdsKey.split(',') : []),
  );

  if (doctorIdsKey !== prevDoctorIdsKey) {
    setPrevDoctorIdsKey(doctorIdsKey);
    setSelectedDoctorIds(new Set(doctorIdsKey ? doctorIdsKey.split(',') : []));
  }

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctorIds((prev) => {
      const next = new Set(prev);
      if (next.has(doctorId)) {
        next.delete(doctorId);
      } else {
        next.add(doctorId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedDoctorIds((prev) =>
      prev.size === doctors.length ? new Set() : new Set(doctors.map((doctor) => doctor.id)),
    );
  };

  const visibleAppointments = useMemo(
    () => appointments.filter((appointment) => selectedDoctorIds.has(appointment.doctorProfileId)),
    [appointments, selectedDoctorIds],
  );

  return { doctors, selectedDoctorIds, toggleDoctor, toggleAll, visibleAppointments };
};
