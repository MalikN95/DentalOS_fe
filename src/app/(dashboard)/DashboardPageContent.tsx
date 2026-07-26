'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable/AppointmentsTable';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { buildDashboardStats } from '@/helpers/dashboard';
import { useNewPatientsToday } from '@/hooks/useNewPatientsToday';
import { TODAY_APPOINTMENTS_QUERY_KEY, useTodayAppointments } from '@/hooks/useTodayAppointments';
import { useTodayRevenue } from '@/hooks/useTodayRevenue';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './page.module.css';

// Only these roles can call /analytics/*; everyone else sees "No access" on the revenue card.
const REVENUE_VISIBLE_ROLES = ['owner', 'admin', 'accountant'];

export const DashboardPageContent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);
  const canViewRevenue = currentUser ? REVENUE_VISIBLE_ROLES.includes(currentUser.role) : false;

  const { data: appointments, isLoading, error } = useTodayAppointments();
  const { data: revenue } = useTodayRevenue(canViewRevenue);
  const { data: newPatientsCount } = useNewPatientsToday();

  const stats = useMemo(
    () =>
      buildDashboardStats({
        t,
        appointments: appointments ?? [],
        newPatientsCount,
        revenueTotal: revenue?.totalPaid,
        canViewRevenue,
      }),
    [t, appointments, newPatientsCount, revenue, canViewRevenue],
  );

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
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} />
        ))}
      </div>

      <AppointmentsTable
        appointments={appointments ?? []}
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
