import type { InvoiceStatus } from '@/common/types/finance';
import type { BadgeColor } from '@/components/ui';

// Labels live in the locale dictionary (t.finance.status); only colors here.
export const invoiceStatusColor: Record<InvoiceStatus, BadgeColor> = {
  pending: 'gray',
  partially_paid: 'warning',
  paid: 'success',
  refunded: 'primary',
  cancelled: 'danger',
};
