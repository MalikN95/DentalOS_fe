'use client';

import { useId, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { InvoiceStatus } from '@/common/types/finance';
import type { StaffRole } from '@/common/types/staff';
import { ChartIcon, WalletIcon, XCircleIcon } from '@/components/icons/icons';
import { AppointmentManageModalLoader } from '@/components/dashboard/AppointmentManageModal/AppointmentManageModalLoader';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { InvoicesTable } from '@/components/finance/InvoicesTable/InvoicesTable';
import { RevenueByMethod } from '@/components/finance/RevenueByMethod/RevenueByMethod';
import { EmptyState, Pagination } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { getMonthIsoRange, parseDateInputValue, toDateInputValue } from '@/helpers/date';
import { useClinic } from '@/hooks/useClinic';
import { INVOICES_QUERY_KEY, useInvoices } from '@/hooks/useInvoices';
import { useRevenue } from '@/hooks/useRevenue';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './FinancePageContent.module.css';

const FINANCE_ROLES: StaffRole[] = ['owner', 'admin', 'accountant'];

const STATUS_OPTIONS: InvoiceStatus[] = [
  'pending',
  'partially_paid',
  'paid',
  'refunded',
  'cancelled',
];

export const FinancePageContent = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dateFromFieldId = useId();
  const dateToFieldId = useId();
  const statusFieldId = useId();
  // Mock fallback until real auth is wired to the API
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const hasAccess = FINANCE_ROLES.includes(currentUser.role as StaffRole);

  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';

  const [range, setRange] = useState(() => getMonthIsoRange(new Date()));
  const [managingAppointmentId, setManagingAppointmentId] = useState<string | null>(null);

  const revenueQuery = useRevenue(range);
  const {
    invoices,
    total,
    page,
    limit,
    status,
    setPage,
    setLimit,
    setStatus,
    query: invoicesQuery,
  } = useInvoices(range);

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

  const handleAppointmentChanged = () => {
    queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] }).catch(() => undefined);
    queryClient
      .invalidateQueries({ queryKey: ['analytics', 'revenue'] })
      .catch(() => undefined);
  };

  if (!hasAccess) {
    return (
      <EmptyState title={t.finance.noAccessTitle} description={t.finance.noAccessDescription} />
    );
  }

  const revenue = revenueQuery.data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t.finance.title}</h1>
          <p className={styles.subtitle}>{t.finance.description}</p>
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
          label={t.finance.statPaid}
          value={revenue ? formatMoney(String(revenue.totalPaid), currency) : '—'}
          icon={<WalletIcon size={16} />}
          accent="success"
        />
        <StatCard
          label={t.finance.statRefunded}
          value={revenue ? formatMoney(String(revenue.totalRefunded), currency) : '—'}
          icon={<XCircleIcon size={16} />}
          accent="danger"
        />
        <StatCard
          label={t.finance.statNet}
          value={revenue ? formatMoney(String(revenue.net), currency) : '—'}
          icon={<ChartIcon size={16} />}
          accent="primary"
        />
      </div>

      <RevenueByMethod
        items={revenue?.byMethod ?? []}
        currency={currency}
        isLoading={revenueQuery.isLoading}
      />

      <div className={styles.toolbar}>
        <label className={styles.statusField} htmlFor={statusFieldId}>
          <span className={styles.dateLabel}>{t.finance.colStatus}</span>
          <select
            id={statusFieldId}
            className={styles.statusSelect}
            value={status ?? ''}
            onChange={(event) =>
              setStatus(event.target.value ? (event.target.value as InvoiceStatus) : null)
            }
          >
            <option value="">{t.finance.statusFilterAll}</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t.finance.status[option]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <InvoicesTable
        invoices={invoices}
        currency={currency}
        isLoading={invoicesQuery.isLoading}
        errorMessage={invoicesQuery.error?.message ?? null}
        className={styles.tableSection}
        onAppointmentClick={setManagingAppointmentId}
        footer={
          <Pagination
            page={page}
            limit={limit}
            total={total}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        }
      />

      {managingAppointmentId ? (
        <AppointmentManageModalLoader
          appointmentId={managingAppointmentId}
          onClose={() => setManagingAppointmentId(null)}
          onChanged={handleAppointmentChanged}
        />
      ) : null}
    </div>
  );
};
