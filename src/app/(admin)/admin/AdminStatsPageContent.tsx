'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { StatCard, type StatCardAccent } from '@/components/dashboard/StatCard/StatCard';
import { AreaChart } from '@/components/charts/AreaChart/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart/DonutChart';
import { LineChart } from '@/components/charts/LineChart/LineChart';
import { PatientsIcon, PinIcon, StaffIcon, WalletIcon } from '@/components/icons/icons';
import { formatMonthLabel } from '@/helpers/date';
import {
  usePlatformClinicsGrowth,
  usePlatformOverview,
  usePlatformRevenueByMonth,
} from '@/hooks/usePlatformStats';
import styles from './AdminStatsPageContent.module.css';

const MONTHS_RANGE = 6;

const numberFormatter = new Intl.NumberFormat('ru-RU');
const formatNumber = (value: number) => numberFormatter.format(value);

const monthToLabel = (month: string) => formatMonthLabel(new Date(`${month}-01T00:00:00Z`));

const STAT_ICONS: Record<string, { icon: React.ReactNode; accent: StatCardAccent }> = {
  clinics: { icon: <PinIcon size={16} />, accent: 'primary' },
  doctors: { icon: <StaffIcon size={16} />, accent: 'success' },
  patients: { icon: <PatientsIcon size={16} />, accent: 'primary' },
  revenue: { icon: <WalletIcon size={16} />, accent: 'success' },
};

export const AdminStatsPageContent = () => {
  const { t } = useTranslation();
  const { data: overview, isLoading: isOverviewLoading } = usePlatformOverview();
  const { data: revenuePoints, isLoading: isRevenueLoading } =
    usePlatformRevenueByMonth(MONTHS_RANGE);
  const { data: growthPoints, isLoading: isGrowthLoading } =
    usePlatformClinicsGrowth(MONTHS_RANGE);

  const stats = [
    {
      id: 'clinics',
      label: t.admin.statTotalClinics,
      value: overview ? formatNumber(overview.totalClinics) : t.common.dash,
    },
    {
      id: 'doctors',
      label: t.admin.statTotalDoctors,
      value: overview ? formatNumber(overview.totalDoctors) : t.common.dash,
    },
    {
      id: 'patients',
      label: t.admin.statTotalPatients,
      value: overview ? formatNumber(overview.totalPatients) : t.common.dash,
    },
    {
      id: 'revenue',
      label: t.admin.statTotalRevenue,
      value: overview ? formatNumber(overview.totalRevenue) : t.common.dash,
    },
  ];

  const revenueChartPoints = (revenuePoints ?? []).map((point) => ({
    label: monthToLabel(point.month),
    value: point.total,
  }));

  const growthChartPoints = (growthPoints ?? []).map((point) => ({
    label: monthToLabel(point.month),
    value: point.count,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={STAT_ICONS[stat.id]?.icon}
            accent={STAT_ICONS[stat.id]?.accent}
          />
        ))}
      </div>

      <div className={styles.row}>
        <div className={`${styles.card} ${styles.ringCard}`}>
          <h2 className={styles.cardTitle}>{t.admin.chartClinicsStatus}</h2>
          {isOverviewLoading || !overview ? (
            <span className={styles.state}>{t.admin.loading}</span>
          ) : (
            <DonutChart
              centerValue={formatNumber(overview.totalClinics)}
              centerLabel={t.admin.statTotalClinics}
              segments={[
                {
                  value: overview.activeClinics,
                  colorVar: '--color-green-500',
                  label: t.common.active,
                },
                {
                  value: overview.blockedClinics,
                  colorVar: '--color-gray-200',
                  label: t.admin.statusBlocked,
                },
              ]}
            />
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t.admin.chartRevenue}</h2>
          {isRevenueLoading ? (
            <span className={styles.state}>{t.admin.loading}</span>
          ) : (
            <LineChart points={revenueChartPoints} formatValue={formatNumber} />
          )}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>{t.admin.chartClinicsGrowth}</h2>
        {isGrowthLoading ? (
          <span className={styles.state}>{t.admin.loading}</span>
        ) : (
          <AreaChart points={growthChartPoints} formatValue={formatNumber} />
        )}
      </div>
    </div>
  );
};
