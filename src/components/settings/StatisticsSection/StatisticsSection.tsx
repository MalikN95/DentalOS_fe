'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { AgeGroupBreakdownItem, GenderBreakdownItem } from '@/common/types/analytics';
import type { StaffRole } from '@/common/types/staff';
import { AreaChart } from '@/components/charts/AreaChart/AreaChart';
import { DonutChart } from '@/components/charts/DonutChart/DonutChart';
import { RankedBarList } from '@/components/charts/RankedBarList/RankedBarList';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { RevenueByMethod } from '@/components/finance/RevenueByMethod/RevenueByMethod';
import {
  CalendarIcon,
  ChartIcon,
  PatientsIcon,
  WalletIcon,
  XCircleIcon,
} from '@/components/icons/icons';
import { EmptyState } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { formatDate, getMonthIsoRange, parseDateInputValue, toDateInputValue } from '@/helpers/date';
import { useCancellations } from '@/hooks/useCancellations';
import { useClinic } from '@/hooks/useClinic';
import { useDoctorsLoad } from '@/hooks/useDoctorsLoad';
import { usePatientDemographics } from '@/hooks/usePatientDemographics';
import { useRepeatVisits } from '@/hooks/useRepeatVisits';
import { useRevenue } from '@/hooks/useRevenue';
import { useTopServices } from '@/hooks/useTopServices';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './StatisticsSection.module.css';

const STATISTICS_ROLES: StaffRole[] = ['owner', 'admin'];

const GENDER_COLORS: Record<GenderBreakdownItem['gender'], string> = {
  male: '--color-blue-500',
  female: '--color-maroon-500',
  other: '--color-orange-500',
  unknown: '--color-gray-200',
};

const AGE_GROUP_COLORS: Record<AgeGroupBreakdownItem['group'], string> = {
  '0-17': '--color-blue-500',
  '18-34': '--color-green-500',
  '35-54': '--color-orange-500',
  '55+': '--color-primary-500',
  unknown: '--color-gray-200',
};

const numberFormatter = new Intl.NumberFormat('ru-RU');
const formatNumber = (value: number) => numberFormatter.format(value);
const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

type ChartCardProps = {
  title: string;
  isLoading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
};

const ChartCard = ({ title, isLoading, isEmpty, children }: ChartCardProps) => {
  const { t } = useTranslation();

  let content = children;
  if (isLoading) {
    content = <span className={styles.state}>{t.admin.loading}</span>;
  } else if (isEmpty) {
    content = <span className={styles.state}>{t.statistics.empty}</span>;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
      {content}
    </div>
  );
};

export const StatisticsSection = () => {
  const { t } = useTranslation();
  const dateFromFieldId = useId();
  const dateToFieldId = useId();
  // Mock fallback until real auth is wired to the API
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const hasAccess = STATISTICS_ROLES.includes(currentUser.role as StaffRole);

  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  const [range, setRange] = useState(() => getMonthIsoRange(new Date()));

  const revenueQuery = useRevenue(range);
  const cancellationsQuery = useCancellations(range);
  const repeatVisitsQuery = useRepeatVisits(range);
  const topServicesQuery = useTopServices(range);
  const doctorsLoadQuery = useDoctorsLoad(range);
  const demographicsQuery = usePatientDemographics();

  const handleFromChange = (value: string) => {
    if (!value) return;
    setRange((prev) => ({ ...prev, from: parseDateInputValue(value).toISOString() }));
  };

  const handleToChange = (value: string) => {
    if (!value) return;
    const end = parseDateInputValue(value);
    end.setHours(23, 59, 59, 999);
    setRange((prev) => ({ ...prev, to: end.toISOString() }));
  };

  if (!hasAccess) {
    return (
      <EmptyState
        title={t.statistics.noAccessTitle}
        description={t.statistics.noAccessDescription}
      />
    );
  }

  const revenue = revenueQuery.data;
  const cancellations = cancellationsQuery.data;
  const repeatVisits = repeatVisitsQuery.data;
  const demographics = demographicsQuery.data;

  const revenueTrendPoints = (revenue?.byDay ?? []).map((point) => ({
    label: formatDate(point.date).slice(0, 5),
    value: point.amount,
  }));

  const topServicesItems = (topServicesQuery.data ?? []).map((service) => ({
    label: service.name,
    value: service.count,
  }));

  const doctorsLoadItems = (doctorsLoadQuery.data ?? []).map((doctor) => ({
    label: doctor.doctorName,
    value: doctor.appointmentsCount,
  }));

  const insurerItems = (demographics?.byInsurer ?? []).map((insurer) => ({
    label: insurer.company === 'self_pay' ? t.statistics.selfPay : insurer.company,
    value: insurer.count,
  }));

  const genderSegments = (demographics?.byGender ?? [])
    .filter((item) => item.count > 0)
    .map((item) => ({
      value: item.count,
      colorVar: GENDER_COLORS[item.gender],
      label: t.statistics.genderLabels[item.gender],
    }));

  const ageSegments = (demographics?.byAgeGroup ?? [])
    .filter((item) => item.count > 0)
    .map((item) => ({
      value: item.count,
      colorVar: AGE_GROUP_COLORS[item.group],
      label: t.statistics.ageGroupLabels[item.group],
    }));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{t.statistics.title}</h2>
          <p className={styles.subtitle}>{t.statistics.description}</p>
        </div>
        <div className={styles.dateRange}>
          <label className={styles.dateField} htmlFor={dateFromFieldId}>
            <span className={styles.dateLabel}>{t.finance.dateFrom}</span>
            <input
              id={dateFromFieldId}
              type="date"
              className={styles.dateInput}
              value={toDateInputValue(new Date(range.from))}
              onChange={(event) => handleFromChange(event.target.value)}
            />
          </label>
          <label className={styles.dateField} htmlFor={dateToFieldId}>
            <span className={styles.dateLabel}>{t.finance.dateTo}</span>
            <input
              id={dateToFieldId}
              type="date"
              className={styles.dateInput}
              value={toDateInputValue(new Date(range.to))}
              onChange={(event) => handleToChange(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className={styles.stats}>
        <StatCard
          label={t.statistics.statTotalPatients}
          value={demographics ? formatNumber(demographics.totalPatients) : t.common.dash}
          icon={<PatientsIcon size={16} />}
          accent="primary"
        />
        <StatCard
          label={t.statistics.statAppointments}
          value={cancellations ? formatNumber(cancellations.total) : t.common.dash}
          icon={<CalendarIcon size={16} />}
          accent="primary"
        />
        <StatCard
          label={t.statistics.statNetRevenue}
          value={revenue ? formatMoney(String(revenue.net), currency) : t.common.dash}
          icon={<WalletIcon size={16} />}
          accent="success"
        />
        <StatCard
          label={t.statistics.statCancelled}
          value={
            cancellations
              ? `${formatNumber(cancellations.cancelled)} (${formatPercent(cancellations.cancellationRate)})`
              : t.common.dash
          }
          icon={<XCircleIcon size={16} />}
          accent="danger"
        />
        <StatCard
          label={t.statistics.statNoShow}
          value={
            cancellations
              ? `${formatNumber(cancellations.noShow)} (${formatPercent(cancellations.noShowRate)})`
              : t.common.dash
          }
          icon={<XCircleIcon size={16} />}
          accent="danger"
        />
        <StatCard
          label={t.statistics.statReturningRate}
          value={repeatVisits ? formatPercent(repeatVisits.rate) : t.common.dash}
          icon={<ChartIcon size={16} />}
          accent="success"
        />
      </div>

      <div className={styles.row}>
        <ChartCard
          title={t.statistics.chartGender}
          isLoading={demographicsQuery.isLoading}
          isEmpty={genderSegments.length === 0}
        >
          <DonutChart
            centerValue={demographics ? formatNumber(demographics.totalPatients) : '0'}
            centerLabel={t.statistics.statTotalPatients}
            segments={genderSegments}
          />
        </ChartCard>

        <ChartCard
          title={t.statistics.chartAge}
          isLoading={demographicsQuery.isLoading}
          isEmpty={ageSegments.length === 0}
        >
          <DonutChart
            centerValue={demographics ? formatNumber(demographics.totalPatients) : '0'}
            centerLabel={t.statistics.statTotalPatients}
            segments={ageSegments}
          />
        </ChartCard>
      </div>

      <div className={styles.row}>
        <RevenueByMethod
          items={revenue?.byMethod ?? []}
          currency={currency}
          isLoading={revenueQuery.isLoading}
        />

        <ChartCard
          title={t.statistics.chartInsurers}
          isLoading={demographicsQuery.isLoading}
          isEmpty={insurerItems.length === 0}
        >
          <RankedBarList items={insurerItems} colorVar="--color-primary-500" />
        </ChartCard>
      </div>

      <div className={styles.row}>
        <ChartCard
          title={t.statistics.chartTopServices}
          isLoading={topServicesQuery.isLoading}
          isEmpty={topServicesItems.length === 0}
        >
          <RankedBarList items={topServicesItems} colorVar="--color-green-500" />
        </ChartCard>

        <ChartCard
          title={t.statistics.chartDoctorsLoad}
          isLoading={doctorsLoadQuery.isLoading}
          isEmpty={doctorsLoadItems.length === 0}
        >
          <RankedBarList items={doctorsLoadItems} colorVar="--color-orange-500" />
        </ChartCard>
      </div>

      <ChartCard
        title={t.statistics.chartRevenueTrend}
        isLoading={revenueQuery.isLoading}
        isEmpty={false}
      >
        <AreaChart
          points={revenueTrendPoints}
          formatValue={(value) => formatMoney(String(value), currency)}
        />
      </ChartCard>
    </div>
  );
};
