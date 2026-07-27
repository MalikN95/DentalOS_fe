import type { Appointment, DashboardStat } from '@/common/types/appointment';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import { formatMoney } from '@/helpers/appointment-status';

const CANCELLED_STATUSES: Appointment['status'][] = ['cancelled', 'no_show'];

type BuildDashboardStatsParams = {
  t: Dictionary;
  appointments: Appointment[];
  newPatientsCount: number | undefined;
  revenueTotal: number | undefined;
  canViewRevenue: boolean;
  currency: string;
};

const buildRevenueValue = ({
  t,
  revenueTotal,
  canViewRevenue,
  currency,
}: Pick<
  BuildDashboardStatsParams,
  't' | 'revenueTotal' | 'canViewRevenue' | 'currency'
>): string => {
  if (!canViewRevenue) return t.dashboard.stats.noAccess;
  if (revenueTotal === undefined) return t.common.dash;
  return formatMoney(String(revenueTotal), currency);
};

export const buildDashboardStats = ({
  t,
  appointments,
  newPatientsCount,
  revenueTotal,
  canViewRevenue,
  currency,
}: BuildDashboardStatsParams): DashboardStat[] => {
  const cancellationsCount = appointments.filter((appointment) =>
    CANCELLED_STATUSES.includes(appointment.status),
  ).length;

  return [
    {
      id: 'appointments',
      label: t.dashboard.stats.todayAppointments,
      value: String(appointments.length),
    },
    {
      id: 'new-patients',
      label: t.dashboard.stats.newPatients,
      value: newPatientsCount !== undefined ? String(newPatientsCount) : t.common.dash,
    },
    {
      id: 'revenue',
      label: t.dashboard.stats.revenueToday,
      value: buildRevenueValue({ t, revenueTotal, canViewRevenue, currency }),
    },
    {
      id: 'cancellations',
      label: t.dashboard.stats.cancellationsToday,
      value: String(cancellationsCount),
    },
  ];
};
