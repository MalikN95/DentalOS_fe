'use client';

import { useId, useState } from 'react';
import type { Appointment, AppointmentStatus } from '@/common/types/appointment';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { StaffRole } from '@/common/types/staff';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Alert, Button, TextField, type ButtonColor } from '@/components/ui';
import { getAppointmentCode } from '@/helpers/appointment-code';
import {
  actionTargetStatus,
  appointmentStatusActions,
  formatMoney,
  isTerminalStatus,
  type AppointmentStatusAction,
} from '@/helpers/appointment-status';
import { useAppointmentPayment } from '@/hooks/useAppointmentPayment';
import { useAppointmentStatus } from '@/hooks/useAppointmentStatus';
import { useClinic } from '@/hooks/useClinic';
import { useMedicalRecordForm } from '@/hooks/useMedicalRecordForm';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import { AppointmentTreatmentSection } from './AppointmentTreatmentSection';
import styles from './AppointmentManagePanel.module.css';

const RECORD_ROLES: StaffRole[] = ['owner', 'admin', 'doctor'];
const PAYMENT_ROLES: StaffRole[] = ['owner', 'admin', 'accountant', 'receptionist'];
// Only the methods a front-desk clerk can enter manually; gift certificates
// and memberships are redeemed through their own dedicated flows.
const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;
type OfferedPaymentMethod = (typeof PAYMENT_METHODS)[number];

type AppointmentManagePanelProps = {
  appointment: Appointment;
  className?: string;
  style?: React.CSSProperties;
  onChanged?: () => void;
  /** Lets a wrapper (modal title, page header) mirror the live status. */
  onStatusChange?: (status: AppointmentStatus) => void;
};

type RecordFieldProps = {
  label: string;
  required?: boolean;
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const RecordField = ({ label, required, error, ...textareaProps }: RecordFieldProps) => {
  const fieldId = useId();

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? ' *' : ''}
      </label>
      <textarea id={fieldId} className={styles.textarea} {...textareaProps} />
      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
};

const ReadonlyRow = ({ label, value }: { label: string; value: string | null }) => (
  <div className={styles.field}>
    <span className={styles.label}>{label}</span>
    <span className={styles.readonlyValue}>{value?.trim() ? value : '—'}</span>
  </div>
);

export const AppointmentManagePanel = ({
  appointment,
  className,
  style,
  onChanged,
  onStatusChange,
}: AppointmentManagePanelProps) => {
  const { t: dict } = useTranslation();
  const t = dict.appointments;
  // Mock fallback until real auth is wired to the API
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canEditRecord = RECORD_ROLES.includes(currentUser.role as StaffRole);
  const canRecordPayment = PAYMENT_ROLES.includes(currentUser.role as StaffRole);
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';
  const paymentMethodFieldId = useId();

  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [cancelledInfo, setCancelledInfo] = useState<{
    reason: string | null;
    by: Appointment['cancelledBy'];
  }>({ reason: appointment.cancellationReason, by: appointment.cancelledBy });
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<OfferedPaymentMethod>('cash');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const statusMutation = useAppointmentStatus({
    appointmentId: appointment.id,
    onSuccess: (updated) => {
      setStatus(updated.status);
      setCancelledInfo({ reason: updated.cancellationReason, by: updated.cancelledBy });
      onStatusChange?.(updated.status);
      onChanged?.();
    },
  });

  const {
    form,
    mutation: recordMutation,
    isLoading: isRecordLoading,
    existingRecord,
  } = useMedicalRecordForm({
    appointment,
    onSaved: () => onChanged?.(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const {
    total: paymentTotal,
    totalPaid,
    isLoading: isPaymentLoading,
    mutation: paymentMutation,
  } = useAppointmentPayment({
    appointment,
    onPaid: () => onChanged?.(),
  });

  const remaining = Math.max(paymentTotal - totalPaid, 0);

  const handleAction = (action: AppointmentStatusAction) => {
    if (action === 'cancel') {
      setIsCancelling(true);
      return;
    }
    statusMutation.mutate({ status: actionTargetStatus[action] });
  };

  const handleConfirmCancel = () => {
    const reason = cancellationReason.trim();
    if (!reason) {
      setCancelError(t.cancelReasonRequired);
      return;
    }
    statusMutation.mutate({ status: 'cancelled', cancellationReason: reason });
  };

  const handleCancelBack = () => {
    setIsCancelling(false);
    setCancellationReason('');
    setCancelError(null);
  };

  const handleSaveRecord = handleSubmit((values) => {
    recordMutation.mutate(values);
  });

  const handleCompleteTreatment = handleSubmit((values) => {
    recordMutation.mutate(values, {
      onSuccess: () => {
        statusMutation.mutate({ status: 'completed' });
      },
    });
  });

  const handleRecordPayment = () => {
    const amount = paymentAmount.trim() ? Number(paymentAmount) : remaining;
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError(t.paymentAmountInvalid);
      return;
    }

    paymentMutation.mutate(
      { amount, method: paymentMethod },
      { onSuccess: () => setPaymentAmount('') },
    );
  };

  const actionLabels: Record<AppointmentStatusAction, string> = {
    confirm: t.confirmStatus,
    arrive: t.markArrived,
    no_show: t.markNoShow,
    start: t.startTreatment,
    complete: t.completeTreatment,
    cancel: t.cancelAppointment,
  };

  const actionColors: Record<AppointmentStatusAction, ButtonColor> = {
    confirm: 'primary',
    arrive: 'success',
    no_show: 'warning',
    start: 'primary',
    complete: 'primary',
    cancel: 'danger',
  };

  return (
    <div className={`${styles.panel} ${className ?? ''}`} style={style}>
      <div className={styles.summary}>
        <div className={styles.field}>
          <span className={styles.label}>{t.codeLabel}</span>
          <span className={styles.readonlyValue}>{getAppointmentCode(appointment.id)}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t.colPatient}</span>
          <span className={styles.readonlyValue}>{appointment.patientName}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t.colTime}</span>
          <span className={styles.readonlyValue}>{appointment.time}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t.colService}</span>
          <span className={styles.readonlyValue}>{appointment.service}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t.colDoctor}</span>
          <span className={styles.readonlyValue}>{appointment.doctorName}</span>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>{t.colCabinet}</span>
          <span className={styles.readonlyValue}>{appointment.cabinet}</span>
        </div>
      </div>

      <div className={styles.paymentSummary}>
        <div className={styles.paymentItem}>
          <span className={styles.paymentLabel}>{t.priceLabel}</span>
          <span className={styles.paymentValue}>
            {isPaymentLoading ? dict.common.dash : formatMoney(String(paymentTotal), currency)}
          </span>
        </div>
        <div className={styles.paymentDivider} aria-hidden="true" />
        <div className={styles.paymentItem}>
          <span className={styles.paymentLabel}>{t.paidLabel}</span>
          <span className={`${styles.paymentValue} ${styles.paymentValuePaid}`}>
            {isPaymentLoading ? dict.common.dash : formatMoney(String(totalPaid), currency)}
          </span>
        </div>
        <div className={styles.paymentDivider} aria-hidden="true" />
        <div className={styles.paymentItem}>
          <span className={styles.paymentLabel}>{t.debtLabel}</span>
          <span
            className={`${styles.paymentValue} ${remaining > 0 ? styles.paymentValueDebt : styles.paymentValuePaid}`}
          >
            {isPaymentLoading ? dict.common.dash : formatMoney(String(remaining), currency)}
          </span>
        </div>
      </div>

      {statusMutation.error ? <Alert color="danger">{statusMutation.error.message}</Alert> : null}

      <div className={styles.card}>
        <span className={styles.cardTitle}>{t.statusLabel}</span>

        {status === 'cancelled' ? (
          <div className={styles.state}>
            {cancelledInfo.by ? (
              <p>
                {cancelledInfo.by.isPatient ? t.cancelledByPatientLabel : t.cancelledByStaffLabel}{' '}
                {cancelledInfo.by.name}
              </p>
            ) : null}
            {cancelledInfo.reason ? (
              <p>
                {t.cancelReasonLabel}: {cancelledInfo.reason}
              </p>
            ) : null}
          </div>
        ) : null}

        {isTerminalStatus(status) && status !== 'cancelled' ? (
          <p className={styles.state}>{t.terminalNote}</p>
        ) : null}

        {!isTerminalStatus(status) && isCancelling ? (
          <div className={styles.cancelForm}>
            <TextField
              label={t.cancelReasonLabel}
              placeholder={t.cancelReasonPlaceholder}
              value={cancellationReason}
              error={cancelError ?? undefined}
              onChange={(event) => {
                setCancellationReason(event.target.value);
                setCancelError(null);
              }}
            />
            <div className={styles.actions}>
              <Button type="button" variant="soft" color="gray" onClick={handleCancelBack}>
                {t.cancelBack}
              </Button>
              <Button
                type="button"
                color="danger"
                disabled={statusMutation.isPending}
                onClick={handleConfirmCancel}
              >
                {statusMutation.isPending ? t.updatingStatus : t.cancelConfirm}
              </Button>
            </div>
          </div>
        ) : null}

        {!isTerminalStatus(status) && !isCancelling ? (
          <div className={styles.statusActions}>
            {appointmentStatusActions[status]
              // when the current user can fill in the record, "complete" is
              // handled by the combined button in the record section below
              .filter((action) => !(action === 'complete' && canEditRecord))
              .map((action) => (
                <Button
                  key={action}
                  type="button"
                  variant={action === 'cancel' ? 'soft' : 'solid'}
                  color={actionColors[action]}
                  disabled={statusMutation.isPending}
                  onClick={() => handleAction(action)}
                >
                  {actionLabels[action]}
                </Button>
              ))}
          </div>
        ) : null}
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>{t.planSectionTitle}</span>
        <AppointmentTreatmentSection
          patientId={appointment.patientId}
          canEdit={canEditRecord}
        />
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>{t.paymentSectionTitle}</span>

        {isPaymentLoading ? <p className={styles.state}>{dict.common.loading}</p> : null}

        {!isPaymentLoading && remaining <= 0 ? (
          <p className={styles.state}>{t.paidInFull}</p>
        ) : null}

        {!isPaymentLoading && remaining > 0 && !canRecordPayment ? (
          <p className={styles.state}>{t.paymentForbidden}</p>
        ) : null}

        {!isPaymentLoading && remaining > 0 && canRecordPayment ? (
          <div className={styles.recordForm}>
            <TextField
              label={t.paymentAmountLabel}
              type="number"
              min="0"
              step="0.01"
              placeholder={remaining.toFixed(2)}
              value={paymentAmount}
              error={paymentError ?? undefined}
              onChange={(event) => {
                setPaymentAmount(event.target.value);
                setPaymentError(null);
              }}
            />

            <div className={styles.field}>
              <label className={styles.label} htmlFor={paymentMethodFieldId}>
                {t.paymentMethodLabel}
              </label>
              <select
                id={paymentMethodFieldId}
                className={styles.select}
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as OfferedPaymentMethod)}
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {dict.paymentMethods[method]}
                  </option>
                ))}
              </select>
            </div>

            {paymentMutation.error ? (
              <Alert color="danger">{paymentMutation.error.message}</Alert>
            ) : null}

            <div className={styles.actions}>
              <Button
                type="button"
                disabled={paymentMutation.isPending}
                onClick={handleRecordPayment}
              >
                {paymentMutation.isPending ? t.recordingPayment : t.recordPayment}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.card}>
        <span className={styles.cardTitle}>{t.recordSectionTitle}</span>

        {isRecordLoading ? <p className={styles.state}>{dict.common.loading}</p> : null}

        {!isRecordLoading && canEditRecord ? (
          <div className={styles.recordForm}>
            <RecordField label={dict.visits.complaints} {...register('complaints')} />
            <RecordField label={dict.visits.examination} {...register('examination')} />
            <RecordField
              label={dict.visits.diagnosis}
              required
              error={errors.diagnosis?.message}
              {...register('diagnosis')}
            />
            <RecordField label={dict.visits.treatment} {...register('treatment')} />
            <RecordField label={dict.visits.prescriptions} {...register('prescriptions')} />
            <RecordField label={dict.visits.recommendations} {...register('recommendations')} />
            <RecordField label={dict.visits.notes} {...register('notes')} />

            {recordMutation.error ? (
              <Alert color="danger">{recordMutation.error.message}</Alert>
            ) : null}

            <div className={styles.actions}>
              <Button
                type="button"
                variant="soft"
                color="gray"
                disabled={recordMutation.isPending}
                onClick={handleSaveRecord}
              >
                {recordMutation.isPending ? t.savingRecord : t.saveRecord}
              </Button>

              {status === 'in_treatment' ? (
                <Button
                  type="button"
                  disabled={recordMutation.isPending || statusMutation.isPending}
                  onClick={handleCompleteTreatment}
                >
                  {t.completeTreatment}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        {!isRecordLoading && !canEditRecord && existingRecord ? (
          <div className={styles.recordForm}>
            <ReadonlyRow label={dict.visits.complaints} value={existingRecord.complaints} />
            <ReadonlyRow label={dict.visits.examination} value={existingRecord.examination} />
            <ReadonlyRow label={dict.visits.diagnosis} value={existingRecord.diagnosis} />
            <ReadonlyRow label={dict.visits.treatment} value={existingRecord.treatment} />
            <ReadonlyRow label={dict.visits.prescriptions} value={existingRecord.prescriptions} />
            <ReadonlyRow
              label={dict.visits.recommendations}
              value={existingRecord.recommendations}
            />
            <ReadonlyRow label={dict.visits.notes} value={existingRecord.notes} />
          </div>
        ) : null}

        {!isRecordLoading && !canEditRecord && !existingRecord ? (
          <p className={styles.state}>{t.recordForbidden}</p>
        ) : null}
      </div>
    </div>
  );
};
