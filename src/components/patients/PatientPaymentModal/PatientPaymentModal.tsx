'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PaymentMethod } from '@/common/types/finance';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { formatDate } from '@/helpers/date';
import { usePatientPayment } from '@/hooks/usePatientPayment';
import styles from './PatientPaymentModal.module.css';

const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'card', 'transfer'];

type PatientPaymentModalProps = {
  patientId: string;
  currency: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export const PatientPaymentModal = ({
  patientId,
  currency,
  onClose,
  onSuccess,
}: PatientPaymentModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  const invoiceFieldId = useId();
  const methodFieldId = useId();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountError, setAmountError] = useState<string | null>(null);

  const { payableInvoices, invoiceId, setInvoiceId, totalPaid, total, isLoading, mutation } =
    usePatientPayment(patientId, () => {
      onSuccess?.();
      onClose();
    });

  const remaining = Math.max(total - totalPaid, 0);
  const submitError = mutation.error?.message ?? null;

  const handleSubmit = () => {
    const value = amount.trim() ? Number(amount) : remaining;

    if (!Number.isFinite(value) || value <= 0) {
      setAmountError(t.paymentAmountInvalid);
      return;
    }

    mutation.mutate({ amount: value, method });
  };

  return (
    <Modal
      title={dict.patients.paymentModalTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || isLoading || !invoiceId}
            onClick={handleSubmit}
          >
            {mutation.isPending ? t.recordingPayment : t.recordPayment}
          </Button>
        </>
      }
    >
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      {isLoading ? <p className={styles.state}>{dict.common.loading}</p> : null}

      {!isLoading && payableInvoices.length === 0 ? (
        <p className={styles.state}>{dict.patients.noPayableInvoices}</p>
      ) : null}

      {!isLoading && payableInvoices.length > 0 ? (
        <>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={invoiceFieldId}>
              {dict.patients.invoiceLabel}
            </label>
            <select
              id={invoiceFieldId}
              className={styles.select}
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
            >
              {payableInvoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  № {invoice.number} · {formatDate(invoice.createdAt)} ·{' '}
                  {formatMoney(invoice.total, currency)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.summary}>
            <span className={styles.summaryLabel}>{t.debtLabel}</span>
            <span className={styles.summaryValue}>{formatMoney(String(remaining), currency)}</span>
          </div>

          <TextField
            label={t.paymentAmountLabel}
            type="number"
            min="0"
            step="0.01"
            placeholder={remaining.toFixed(2)}
            value={amount}
            error={amountError ?? undefined}
            onChange={(event) => {
              setAmount(event.target.value);
              setAmountError(null);
            }}
          />

          <div className={styles.field}>
            <label className={styles.label} htmlFor={methodFieldId}>
              {t.paymentMethodLabel}
            </label>
            <select
              id={methodFieldId}
              className={styles.select}
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
            >
              {PAYMENT_METHODS.map((offeredMethod) => (
                <option key={offeredMethod} value={offeredMethod}>
                  {dict.paymentMethods[offeredMethod]}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}
    </Modal>
  );
};
