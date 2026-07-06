'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { TODAY_APPOINTMENTS_QUERY_KEY, useTodayAppointments } from '@/hooks/useTodayAppointments';

export const AppointmentsPageContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data, isLoading, error } = useTodayAppointments();

  const handleOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleAppointmentCreated = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: TODAY_APPOINTMENTS_QUERY_KEY })
      .catch(() => undefined);
  }, [queryClient]);

  return (
    <>
      <AppointmentsTable
        appointments={data ?? []}
        isLoading={isLoading}
        errorMessage={error?.message ?? null}
        onAddClick={handleOpenCreateModal}
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
