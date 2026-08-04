'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@/components/icons/icons';
import { Alert, Button, EmptyState } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { formatMonthLabel, parseDateInputValue } from '@/helpers/date';
import { useClinic } from '@/hooks/useClinic';
import { usePortalBookingWizard } from '@/hooks/usePortalBookingWizard';
import styles from './PatientBookingPageContent.module.css';

const formatDayLabel = (value: string): string => {
  const date = parseDateInputValue(value);
  return date.toLocaleDateString('ru-RU', { day: '2-digit', weekday: 'short' });
};

export const PatientBookingPageContent = () => {
  const { t } = useTranslation();
  const { data: clinic } = useClinic();
  const currency = clinic?.currency ?? 'RUB';
  const wizard = usePortalBookingWizard();

  const stepTitle: Record<string, string> = {
    service: t.patientPortal.bookStepService,
    doctor: t.patientPortal.bookStepDoctor,
    datetime: t.patientPortal.bookStepDateTime,
    confirm: t.patientPortal.bookStepConfirm,
    done: t.patientPortal.bookDoneTitle,
  };

  return (
    <div className={styles.page}>
      {wizard.canGoBack ? (
        <button type="button" className={styles.backButton} onClick={wizard.goBack}>
          <ChevronLeftIcon size={18} />
          {t.patientPortal.bookBackButton}
        </button>
      ) : null}

      <h1 className={styles.stepLabel}>{stepTitle[wizard.step]}</h1>

      {wizard.step === 'service' ? (
        <div className={styles.list}>
          {wizard.allServices.length === 0 && !wizard.servicesQuery.isLoading ? (
            <EmptyState title={t.patientPortal.bookNoServices} />
          ) : null}
          {wizard.allServices.map((service) => (
            <button
              key={service.id}
              type="button"
              className={styles.optionCard}
              onClick={() => wizard.selectService(service.id)}
            >
              <span className={styles.optionTitle}>{service.name}</span>
              <span className={styles.optionMeta}>
                {formatMoney(service.price, currency)} ·{' '}
                {format(t.appointments.durationMinutesShort, { minutes: service.durationMinutes })}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {wizard.step === 'doctor' ? (
        <div className={styles.list}>
          {(wizard.doctorsQuery.data ?? []).length === 0 && !wizard.doctorsQuery.isLoading ? (
            <EmptyState title={t.patientPortal.bookNoDoctors} />
          ) : null}
          {(wizard.doctorsQuery.data ?? []).map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              className={styles.optionCard}
              onClick={() => wizard.selectDoctor(doctor.id)}
            >
              <span className={styles.optionTitle}>
                {doctor.firstName} {doctor.lastName}
              </span>
              <span className={styles.optionMeta}>{doctor.specializations.join(', ')}</span>
              {doctor.averageRating ? (
                <span className={styles.optionMeta}>
                  <StarIcon size={14} filled className={styles.starFilled} />{' '}
                  {doctor.averageRating.toFixed(1)} ({doctor.reviewCount})
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {wizard.step === 'datetime' ? (
        <div className={styles.datetime}>
          <div className={styles.monthNav}>
            <button
              type="button"
              className={styles.iconButton}
              disabled={!wizard.canGoToPrevMonth}
              onClick={wizard.goToPrevMonth}
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span>{formatMonthLabel(wizard.visibleMonth)}</span>
            <button type="button" className={styles.iconButton} onClick={wizard.goToNextMonth}>
              <ChevronRightIcon size={16} />
            </button>
          </div>

          <div className={styles.chipRow}>
            {(wizard.daysQuery.data ?? []).length === 0 && !wizard.daysQuery.isLoading ? (
              <EmptyState title={t.patientPortal.bookNoDays} />
            ) : null}
            {(wizard.daysQuery.data ?? []).map((day) => (
              <button
                key={day}
                type="button"
                className={`${styles.chip} ${wizard.date === day ? styles.chipActive : ''}`}
                onClick={() => wizard.selectDate(day)}
              >
                {formatDayLabel(day)}
              </button>
            ))}
          </div>

          {wizard.date ? (
            <div className={styles.chipRow}>
              {(wizard.slotsQuery.data ?? []).length === 0 && !wizard.slotsQuery.isLoading ? (
                <EmptyState title={t.patientPortal.bookNoSlots} />
              ) : null}
              {(wizard.slotsQuery.data ?? []).map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`${styles.chip} ${wizard.time === slot ? styles.chipActive : ''}`}
                  onClick={() => wizard.selectTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {wizard.step === 'confirm' ? (
        <div className={styles.confirm}>
          {wizard.bookingMutation.isError ? (
            <Alert color="danger">{t.patientPortal.bookError}</Alert>
          ) : null}

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t.patientPortal.bookConfirmService}</span>
            <span>{wizard.selectedService?.name}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t.patientPortal.bookConfirmDoctor}</span>
            <span>
              {wizard.selectedDoctor?.firstName} {wizard.selectedDoctor?.lastName}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t.patientPortal.bookConfirmBranch}</span>
            <span>{wizard.selectedBranch?.name}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>{t.patientPortal.bookConfirmDateTime}</span>
            <span>
              {wizard.date ? formatDayLabel(wizard.date) : ''} {wizard.time}
            </span>
          </div>

          <label className={styles.commentLabel} htmlFor="booking-comment">
            {t.patientPortal.bookCommentLabel}
          </label>
          <textarea
            id="booking-comment"
            className={styles.commentInput}
            placeholder={t.patientPortal.bookCommentPlaceholder}
            value={wizard.comment}
            onChange={(event) => wizard.setComment(event.target.value)}
          />

          <Button
            className={styles.confirmButton}
            disabled={wizard.bookingMutation.isPending}
            onClick={wizard.submitBooking}
          >
            {t.patientPortal.bookConfirmButton}
          </Button>
        </div>
      ) : null}

      {wizard.step === 'done' ? (
        <div className={styles.done}>
          <p>{t.patientPortal.bookDoneText}</p>
          <Button variant="soft" color="gray" onClick={wizard.reset}>
            {t.patientPortal.bookAnotherButton}
          </Button>
        </div>
      ) : null}
    </div>
  );
};
