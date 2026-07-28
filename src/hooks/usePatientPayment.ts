'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InvoiceStatus, PaymentMethod } from '@/common/types/finance';
import { fetchInvoice } from '@/helpers/invoices.api';
import { createPayment } from '@/helpers/payments.api';
import { PATIENT_INVOICES_QUERY_KEY, usePatientInvoices } from '@/hooks/usePatientInvoices';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const INVOICE_DETAIL_QUERY_KEY = 'patient-payment-invoice';
const PAYABLE_STATUSES: InvoiceStatus[] = ['pending', 'partially_paid'];

type RecordPaymentInput = {
  amount: number;
  method: PaymentMethod;
};

// Powers the "record a payment" quick action from the patients list: unlike
// useAppointmentPayment (scoped to one known appointment), the user picks
// which of the patient's outstanding invoices to pay against.
export const usePatientPayment = (patientId: string, onPaid?: () => void) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();
  const { invoices, isLoading: isInvoicesLoading } = usePatientInvoices(patientId);

  const payableInvoices = useMemo(
    () => invoices.filter((invoice) => PAYABLE_STATUSES.includes(invoice.status)),
    [invoices],
  );

  // Defaults to the first payable invoice until the user picks a different
  // one — derived at render time so it updates as the list loads, with no
  // effect required.
  const [explicitInvoiceId, setInvoiceId] = useState<string | null>(null);
  const invoiceId = explicitInvoiceId ?? payableInvoices[0]?.id ?? '';

  const invoiceDetailQuery = useQuery({
    queryKey: [INVOICE_DETAIL_QUERY_KEY, invoiceId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchInvoice(accessToken, invoiceId, signal);
    },
    enabled: Boolean(accessToken) && Boolean(invoiceId),
  });

  const invoice = invoiceDetailQuery.data ?? null;

  const totalPaid = useMemo(
    () => (invoice?.payments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0),
    [invoice],
  );
  const total = invoice ? Number(invoice.total) : 0;

  const mutation = useMutation({
    mutationFn: ({ amount, method }: RecordPaymentInput) => {
      if (!accessToken) throw new Error('Not authenticated');
      if (!invoiceId) throw new Error('No invoice selected');
      return createPayment(accessToken, { invoiceId, method, amount });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [PATIENT_INVOICES_QUERY_KEY] })
        .catch(() => undefined);
      queryClient
        .invalidateQueries({ queryKey: [INVOICE_DETAIL_QUERY_KEY] })
        .catch(() => undefined);
      // Also used by useAppointmentPayment on the appointment detail page.
      queryClient.invalidateQueries({ queryKey: ['appointment-invoice'] }).catch(() => undefined);
      onPaid?.();
    },
  });

  return {
    payableInvoices,
    invoiceId,
    setInvoiceId,
    totalPaid,
    total,
    isLoading: isInvoicesLoading || invoiceDetailQuery.isLoading,
    mutation,
  };
};
