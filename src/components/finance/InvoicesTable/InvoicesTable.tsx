'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiInvoice } from '@/common/types/finance';
import { Alert, Badge } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { formatDate } from '@/helpers/date';
import { invoiceStatusColor } from '@/helpers/invoice-status';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './InvoicesTable.module.css';

type InvoicesTableProps = {
  invoices: ApiInvoice[];
  currency: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  footer?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onAppointmentClick?: (appointmentId: string) => void;
};

export const InvoicesTable = ({
  invoices,
  currency,
  isLoading = false,
  errorMessage = null,
  footer,
  className,
  style,
  onAppointmentClick,
}: InvoicesTableProps) => {
  const { t } = useTranslation();

  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div
        ref={tableWrapRef}
        className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
        {...dragScrollHandlers}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.finance.colDate}</th>
              <th>{t.finance.colPatient}</th>
              <th>{t.finance.colNumber}</th>
              <th>{t.finance.colTotal}</th>
              <th>{t.finance.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  {t.finance.loading}
                </td>
              </tr>
            ) : null}

            {!isLoading && invoices.length === 0 ? (
              <tr>
                <td className={styles.stateCell} colSpan={5}>
                  {t.finance.empty}
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className={invoice.appointmentId ? styles.rowClickable : undefined}
                    onClick={
                      invoice.appointmentId
                        ? () => onAppointmentClick?.(invoice.appointmentId as string)
                        : undefined
                    }
                  >
                    <td>{formatDate(invoice.createdAt)}</td>
                    <td>
                      {invoice.patient.lastName} {invoice.patient.firstName}
                    </td>
                    <td>{invoice.number}</td>
                    <td>{formatMoney(invoice.total, currency)}</td>
                    <td>
                      <Badge color={invoiceStatusColor[invoice.status]}>
                        {t.finance.status[invoice.status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
      {footer ?? null}
    </div>
  );
};
