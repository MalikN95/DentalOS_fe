'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appointment } from '@/common/types/appointment';
import type { PaymentMethod } from '@/common/types/finance';
import { createInvoice, fetchInvoice, fetchPatientInvoices } from '@/helpers/invoices.api';
import { createPayment } from '@/helpers/payments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const INVOICE_QUERY_KEY = 'appointment-invoice';

type RecordPaymentInput = {
  amount: number;
  method: PaymentMethod;
};

type UseAppointmentPaymentParams = {
  appointment: Appointment;
  onPaid?: () => void;
};

export const useAppointmentPayment = ({ appointment, onPaid }: UseAppointmentPaymentParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: [INVOICE_QUERY_KEY, appointment.patientId, 'list'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientInvoices(accessToken, appointment.patientId, 100, signal);
    },
    enabled: Boolean(accessToken),
  });

  const invoiceSummary = useMemo(
    () => invoicesQuery.data?.items.find((item) => item.appointmentId === appointment.id) ?? null,
    [invoicesQuery.data, appointment.id],
  );

  const invoiceDetailQuery = useQuery({
    queryKey: [INVOICE_QUERY_KEY, invoiceSummary?.id, 'detail'],
    queryFn: ({ signal }) => {
      if (!accessToken || !invoiceSummary) throw new Error('Not authenticated');
      return fetchInvoice(accessToken, invoiceSummary.id, signal);
    },
    enabled: Boolean(accessToken) && Boolean(invoiceSummary),
  });

  const invoice = invoiceDetailQuery.data ?? null;

  const totalPaid = useMemo(
    () => (invoice?.payments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0),
    [invoice],
  );
  const total = invoice ? Number(invoice.total) : Number(appointment.price);

  const mutation = useMutation({
    mutationFn: async ({ amount, method }: RecordPaymentInput) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const invoiceId = invoice
        ? invoice.id
        : (
            await createInvoice(accessToken, {
              patientId: appointment.patientId,
              appointmentId: appointment.id,
              items: [
                {
                  title: appointment.service,
                  price: Number(appointment.price),
                  quantity: 1,
                },
              ],
            })
          ).id;

      return createPayment(accessToken, { invoiceId, method, amount });
    },
    onSuccess: () => {
      // Broad on purpose: the 'list' query (patientId-keyed) and the 'detail'
      // query (invoiceId-keyed, holding the actual payments[]/totalPaid) don't
      // share a prefix, so both need refetching after a payment is recorded.
      queryClient.invalidateQueries({ queryKey: [INVOICE_QUERY_KEY] }).catch(() => undefined);
      onPaid?.();
    },
  });

  return {
    invoice,
    totalPaid,
    total,
    isLoading: invoicesQuery.isLoading || invoiceDetailQuery.isLoading,
    mutation,
  };
};
