'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiInvoice } from '@/common/types/finance';
import { InvoicesTable } from '@/components/finance/InvoicesTable/InvoicesTable';
import { WalletIcon } from '@/components/icons/icons';
import { Pagination } from '@/components/ui';
import styles from './PatientBilling.module.css';

const LIMIT = 20;

type PatientBillingProps = {
  invoices: ApiInvoice[];
  currency: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientBilling = ({
  invoices,
  currency,
  isLoading = false,
  errorMessage = null,
  className,
  style,
}: PatientBillingProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const total = invoices.length;
  const pageInvoices = invoices.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <section className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <WalletIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.patientBilling.title}</h2>
      </div>

      <InvoicesTable
        className={styles.table}
        invoices={pageInvoices}
        currency={currency}
        isLoading={isLoading}
        errorMessage={errorMessage}
        showPatientColumn={false}
        footer={
          total > 0 ? (
            <Pagination
              page={page}
              limit={LIMIT}
              total={total}
              showRowsPerPage={false}
              onPageChange={setPage}
            />
          ) : null
        }
      />
    </section>
  );
};
