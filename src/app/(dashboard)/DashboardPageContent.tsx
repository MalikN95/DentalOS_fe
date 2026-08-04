'use client';

import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { AppointmentManageModal } from '@/components/dashboard/AppointmentManageModal/AppointmentManageModal';
import { AppointmentsBoard } from '@/components/dashboard/AppointmentsBoard/AppointmentsBoard';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { StatCard, type StatCardAccent } from '@/components/dashboard/StatCard/StatCard';
import { CalendarIcon, PatientsIcon, WalletIcon, XCircleIcon } from '@/components/icons/icons';
import { PatientQuickViewModal } from '@/components/patients/PatientQuickViewModal/PatientQuickViewModal';
import { formatHourLabel } from '@/helpers/appointments-board';
import { buildDashboardStats } from '@/helpers/dashboard';
import { useClinic } from '@/hooks/useClinic';
import { useNewPatientsToday } from '@/hooks/useNewPatientsToday';
import { TODAY_APPOINTMENTS_QUERY_KEY, useTodayAppointments } from '@/hooks/useTodayAppointments';
import { useTodayRevenue } from '@/hooks/useTodayRevenue';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './page.module.css';

// Only these roles can call /analytics/*; everyone else sees "No access" on the revenue card.
const REVENUE_VISIBLE_ROLES = ['owner', 'admin', 'accountant'];

const STAT_VISUALS: Record<string, { icon: React.ReactNode; accent: StatCardAccent }> = {
  appointments: { icon: <CalendarIcon size={16} />, accent: 'primary' },
  'new-patients': { icon: <PatientsIcon size={16} />, accent: 'success' },
  revenue: { icon: <WalletIcon size={16} />, accent: 'primary' },
  cancellations: { icon: <XCircleIcon size={16} />, accent: 'danger' },
};

export const DashboardPageContent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalHour, setCreateModalHour] = useState<number | undefined>(undefined);
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [managingAppointment, setManagingAppointment] = useState<Appointment | null>(null);
  const currentUser = useAppSelector(selectCurrentUser);
  const canViewRevenue = currentUser ? REVENUE_VISIBLE_ROLES.includes(currentUser.role) : false;

  const { data: appointments, isLoading, error } = useTodayAppointments();
  const { data: revenue } = useTodayRevenue(canViewRevenue);
  const { data: newPatientsCount } = useNewPatientsToday();
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  const stats = useMemo(
    () =>
      buildDashboardStats({
        t,
        appointments: appointments ?? [],
        newPatientsCount,
        revenueTotal: revenue?.totalPaid,
        canViewRevenue,
        currency,
      }),
    [t, appointments, newPatientsCount, revenue, canViewRevenue, currency],
  );

  const handleOpenCreateModal = useCallback((hour?: number) => {
    setCreateModalHour(hour);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handleAppointmentsInvalidate = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: TODAY_APPOINTMENTS_QUERY_KEY })
      .catch(() => undefined);
  }, [queryClient]);

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={STAT_VISUALS[stat.id]?.icon}
            accent={STAT_VISUALS[stat.id]?.accent}
          />
        ))}
      </div>

      <AppointmentsBoard
        className={styles.tableSection}
        appointments={appointments ?? []}
        currency={currency}
        title={t.appointments.todayTitle}
        isLoading={isLoading}
        errorMessage={error?.message ?? null}
        onAddClick={handleOpenCreateModal}
        onPatientClick={setViewingPatientId}
        onRowClick={setManagingAppointment}
      />

      {isCreateModalOpen ? (
        <CreateAppointmentModal
          initialTime={createModalHour !== undefined ? formatHourLabel(createModalHour) : undefined}
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
    </div>
  );
};
