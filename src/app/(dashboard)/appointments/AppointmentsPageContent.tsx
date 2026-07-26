'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { addDays } from '@/helpers/date';
import { APPOINTMENTS_BY_DATE_QUERY_KEY, useAppointmentsByDate } from '@/hooks/useAppointmentsByDate';

export const AppointmentsPageContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
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

  const handleAppointmentCreated = useCallback(() => {
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
          onSuccess={handleAppointmentCreated}
        />
      ) : null}
    </>
  );
};
