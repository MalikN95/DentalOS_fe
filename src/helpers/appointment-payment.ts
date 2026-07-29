import type { Dictionary } from '@/common/locale/dictionaries/ru';
import type { InvoiceStatus } from '@/common/types/finance';

// No invoice yet for this appointment reads the same as "pending" — nothing
// has been charged or paid.
export const getAppointmentPaymentLabel = (
  status: InvoiceStatus,
  t: Dictionary,
): string => {
  if (status === 'pending') return t.appointments.paymentPending;
  if (status === 'partially_paid') return t.appointments.paymentPartial;
  if (status === 'paid') return t.appointments.paidLabel;
  return t.finance.status[status];
};
