'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Appointment } from '@/common/types/appointment';
import { AppointmentManageModal } from '@/components/dashboard/AppointmentManageModal/AppointmentManageModal';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { PatientQuickViewModal } from '@/components/patients/PatientQuickViewModal/PatientQuickViewModal';
import { addDays } from '@/helpers/date';
import { APPOINTMENTS_BY_DATE_QUERY_KEY, useAppointmentsByDate } from '@/hooks/useAppointmentsByDate';

export const AppointmentsPageContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [managingAppointment, setManagingAppointment] = useState<Appointment | null>(null);
  const { data, isLoading, error } = useAppointmentsByDate(selectedDate);

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handlePrevDay = useCallback(() => {
    setSelectedDate((date) => addDays(date, -1));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((date) => addDays(date, 1));
  }, []);

  const handleAppointmentsInvalidate = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: APPOINTMENTS_BY_DATE_QUERY_KEY })
      .catch(() => undefined);
  }, [queryClient]);

  return (
    <>
      <AppointmentsTable
        appointments={data ?? []}
        isLoading={isLoading}
        errorMessage={error?.message ?? null}
        onAddClick={handleOpenCreateModal}
        onPatientClick={setViewingPatientId}
        onRowClick={setManagingAppointment}
        dateNav={{
          date: selectedDate,
          onPrevDay: handlePrevDay,
          onNextDay: handleNextDay,
          onSelectDate: setSelectedDate,
        }}
      />
      {isCreateModalOpen ? (
        <CreateAppointmentModal
          onClose={handleCloseCreateModal}
          onSuccess={handleAppointmentsInvalidate}
        />
      ) : null}
      {viewingPatientId ? (
        <PatientQuickViewModal
          patientId={viewingPatientId}
          onClose={() => setViewingPatientId(null)}
        />
      ) : null}
      {managingAppointment ? (
        <AppointmentManageModal
          appointment={managingAppointment}
          onClose={() => setManagingAppointment(null)}
          onChanged={handleAppointmentsInvalidate}
        />
      ) : null}
    </>
  );
};
