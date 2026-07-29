'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { AlertTriangleIcon, FileTextIcon, MailIcon, PhoneIcon, WalletIcon } from '@/components/icons/icons';
import { PatientPaymentModal } from '@/components/patients/PatientPaymentModal/PatientPaymentModal';
import { PatientTimeline } from '@/components/patients/PatientTimeline/PatientTimeline';
import { SendEmailModal } from '@/components/patients/SendEmailModal/SendEmailModal';
import { Badge, PatientAvatar, Tooltip } from '@/components/ui';
import { getAppointmentCode } from '@/helpers/appointment-code';
import { getAppointmentPaymentLabel } from '@/helpers/appointment-payment';
import { appointmentStatusColor, NOT_STARTED_STATUSES } from '@/helpers/appointment-status';
import { getMinutesLate } from '@/helpers/appointments-board';
import { calculateAge, isSameDay } from '@/helpers/date';
import { invoiceStatusColor } from '@/helpers/invoice-status';
import { usePatient } from '@/hooks/usePatient';
import { usePatientDetail } from '@/hooks/usePatientDetail';
import { usePatientInvoices } from '@/hooks/usePatientInvoices';
import { usePatientTimeline } from '@/hooks/usePatientTimeline';
import styles from './AppointmentPatientCard.module.css';

// A card is "late" once this many minutes have passed its start time while
// still sitting in a not-started status (pending/confirmed).
const LATE_THRESHOLD_MINUTES = 15;

type AppointmentPatientCardProps = {
  appointment: Appointment;
  currency: string;
  /** Calendar day this appointment belongs to — the lateness check only applies when it's today. */
  date?: Date;
  onOpenPatient: (patientId: string) => void;
  onOpenAppointment: (appointment: Appointment) => void;
};

export const AppointmentPatientCard = ({
  appointment,
  currency,
  date = new Date(),
  onOpenPatient,
  onOpenAppointment,
}: AppointmentPatientCardProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { patient } = usePatient(appointment.patientId);
  const { upcoming, past, isVisitsLoading } = usePatientDetail(appointment.patientId);
  const { events, isLoading: isTimelineLoading } = usePatientTimeline(appointment.patientId);
  // Shares its query key with usePatientTimeline's own internal fetch, so
  // this doesn't add a second network request — just reads the same cache.
  const { invoices } = usePatientInvoices(appointment.patientId);
  const [now, setNow] = useState(() => new Date());

  // Ticks the "is it late yet" check forward without needing a full page refresh.
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const age = calculateAge(patient?.birthDate ?? null);
  const hasPhone = appointment.patientPhone !== '—';
  const allergies = patient?.allergies ?? [];
  const isCancelled = appointment.status === 'cancelled';

  const isFirstAppointment = useMemo(() => {
    if (isVisitsLoading) return false;
    const visits = [...upcoming, ...past];
    if (visits.length === 0) return false;

    const earliest = visits.reduce((min, visit) =>
      new Date(visit.startsAt) < new Date(min.startsAt) ? visit : min,
    );
    return earliest.id === appointment.id;
  }, [upcoming, past, isVisitsLoading, appointment.id]);

  const isLate =
    isSameDay(date, now) &&
    NOT_STARTED_STATUSES.includes(appointment.status) &&
    getMinutesLate(appointment.time, date, now) >= LATE_THRESHOLD_MINUTES;

  let accentTone: 'cancelled' | 'first' | null = null;
  if (isCancelled) accentTone = 'cancelled';
  else if (isFirstAppointment) accentTone = 'first';

  const invoiceForAppointment = useMemo(
    () => invoices.find((invoice) => invoice.appointmentId === appointment.id) ?? null,
    [invoices, appointment.id],
  );
  const paymentStatus = invoiceForAppointment?.status ?? 'pending';

  const handleOpenAppointment = () => onOpenAppointment(appointment);
  const handleOpenAppointmentKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpenAppointment(appointment);
    }
  };

  return (
    <div className={styles.card}>
      {accentTone ? (
        <span
          className={styles.accentBar}
          data-tone={accentTone}
          title={accentTone === 'cancelled' ? t.appointments.cancelledHint : t.appointments.firstAppointmentHint}
        />
      ) : null}

      <div
        className={styles.info}
        role="button"
        tabIndex={0}
        onClick={handleOpenAppointment}
        onKeyDown={handleOpenAppointmentKeyDown}
      >
        <span className={styles.topRow}>
          <PatientAvatar
            size="sm"
            name={appointment.patientName}
            hasWarning={allergies.length > 0}
            warningLabel={format(t.patientInfo.hasAllergiesWarning, { list: allergies.join(', ') })}
          />
          <span className={styles.nameRow}>
            <button
              type="button"
              className={styles.name}
              onClick={(event) => {
                event.stopPropagation();
                onOpenPatient(appointment.patientId);
              }}
            >
              {appointment.patientName}
            </button>
            {age !== null ? (
              <span className={styles.age}>{format(t.appointments.ageYears, { age })}</span>
            ) : null}
          </span>
        </span>

        <span className={styles.identity}>
          <span className={styles.timeRange}>
            {appointment.time}–{appointment.endTime}
            <span className={styles.timeDuration}>
              {format(t.appointments.durationMinutesShort, { minutes: appointment.durationMinutes })}
            </span>
          </span>
          <span className={styles.meta}>{appointment.patientPhone}</span>
          <span className={styles.meta}>
            {appointment.service} · {appointment.doctorName}
            {appointment.cabinet !== '—' ? ` · ${appointment.cabinet}` : ''}
          </span>
          <span className={styles.badgeRow}>
            <Badge color={appointmentStatusColor[appointment.status]}>
              {t.appointmentStatus[appointment.status]}
            </Badge>
            <span className={styles.paymentDot} aria-hidden="true">
              ·
            </span>
            <span className={styles.paymentText} data-color={invoiceStatusColor[paymentStatus]}>
              {getAppointmentPaymentLabel(paymentStatus, t)}
            </span>
          </span>
          <span className={styles.code}>
            {t.appointments.codeLabel}: {getAppointmentCode(appointment.id)}
          </span>
        </span>
      </div>

      <div className={`${styles.quickActions} ${isLate ? styles.quickActionsLate : ''}`}>
        {isLate ? (
          <Tooltip label={t.appointments.notStartedWarning} side="bottom">
            <button
              type="button"
              className={styles.lateWarning}
              aria-label={t.appointments.notStartedWarning}
            >
              <AlertTriangleIcon size={13} />
            </button>
          </Tooltip>
        ) : null}

        <Tooltip label={t.appointments.quickCall} side="bottom">
          {hasPhone ? (
            <a className={styles.actionButton} href={`tel:${appointment.patientPhone}`}>
              <PhoneIcon size={13} />
            </a>
          ) : (
            <button type="button" className={styles.actionButton} disabled>
              <PhoneIcon size={13} />
            </button>
          )}
        </Tooltip>

        <Tooltip
          label={patient?.email ? t.appointments.quickEmail : t.patients.actionSendEmailNoEmail}
          side="bottom"
        >
          <button
            type="button"
            className={styles.actionButton}
            disabled={!patient?.email}
            onClick={() => setIsEmailOpen(true)}
          >
            <MailIcon size={13} />
          </button>
        </Tooltip>

        <Tooltip label={t.appointments.quickPayment} side="bottom">
          <button type="button" className={styles.actionButton} onClick={() => setIsPaymentOpen(true)}>
            <WalletIcon size={13} />
          </button>
        </Tooltip>

        <Tooltip label={t.appointments.quickProfile} side="bottom">
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => router.push(`/patients/${appointment.patientId}`)}
          >
            <FileTextIcon size={13} />
          </button>
        </Tooltip>
      </div>

      <div className={styles.timelineWrap}>
        <PatientTimeline compact events={events} currency={currency} isLoading={isTimelineLoading} />
      </div>

      {isEmailOpen && patient ? (
        <SendEmailModal patient={patient} onClose={() => setIsEmailOpen(false)} />
      ) : null}

      {isPaymentOpen ? (
        <PatientPaymentModal
          patientId={appointment.patientId}
          currency={currency}
          onClose={() => setIsPaymentOpen(false)}
        />
      ) : null}
    </div>
  );
};
