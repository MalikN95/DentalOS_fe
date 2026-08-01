'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingStep } from '@/hooks/useBookingWizard';
import { useBookingWizard } from '@/hooks/useBookingWizard';
import { BookingConfirmationStep } from '@/components/booking/BookingConfirmationStep/BookingConfirmationStep';
import { BookingDateTimeStep } from '@/components/booking/BookingDateTimeStep/BookingDateTimeStep';
import { BookingDetailsStep } from '@/components/booking/BookingDetailsStep/BookingDetailsStep';
import { BookingDoctorStep } from '@/components/booking/BookingDoctorStep/BookingDoctorStep';
import { BookingServiceStep } from '@/components/booking/BookingServiceStep/BookingServiceStep';
import { ChevronLeftIcon, Logo } from '@/components/icons/icons';
import styles from './page.module.css';

type BookingPageContentProps = {
  clinicSlug: string;
};

export const BookingPageContent = ({ clinicSlug }: BookingPageContentProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;
  const wizard = useBookingWizard(clinicSlug);

  const isInitialLoading =
    wizard.clinicQuery.isLoading || wizard.branchesQuery.isLoading || wizard.servicesQuery.isLoading;
  const initialError = wizard.clinicQuery.error || wizard.branchesQuery.error || wizard.servicesQuery.error;

  const stepOrder: BookingStep[] = ['service', 'doctor', 'datetime', 'details'];
  const stepIndex = stepOrder.indexOf(wizard.step);

  const clinic = wizard.clinicQuery.data;
  const currency = clinic?.currency ?? 'RUB';

  const renderStep = () => {
    if (wizard.step === 'service') {
      return (
        <BookingServiceStep
          categories={wizard.servicesQuery.data ?? []}
          currency={currency}
          onSelect={wizard.selectService}
        />
      );
    }

    if (wizard.step === 'doctor') {
      return (
        <BookingDoctorStep
          doctors={wizard.doctorsQuery.data ?? []}
          onSelect={wizard.selectDoctor}
        />
      );
    }

    if (wizard.step === 'datetime' && wizard.selectedDoctor) {
      return (
        <BookingDateTimeStep
          doctor={wizard.selectedDoctor}
          month={wizard.visibleMonth}
          canGoPrevMonth={wizard.canGoToPrevMonth}
          onPrevMonth={wizard.goToPrevMonth}
          onNextMonth={wizard.goToNextMonth}
          availableDays={wizard.daysQuery.data ?? []}
          isLoadingDays={wizard.daysQuery.isLoading}
          selectedDate={wizard.date}
          onSelectDate={wizard.selectDate}
          slots={wizard.slotsQuery.data ?? []}
          isLoadingSlots={wizard.slotsQuery.isLoading}
          selectedTime={wizard.time}
          onSelectTime={wizard.selectTime}
        />
      );
    }

    if (
      wizard.step === 'details' &&
      wizard.selectedBranch &&
      wizard.selectedService &&
      wizard.selectedDoctor &&
      wizard.date &&
      wizard.time
    ) {
      return (
        <BookingDetailsStep
          branch={wizard.selectedBranch}
          service={wizard.selectedService}
          doctor={wizard.selectedDoctor}
          currency={currency}
          date={wizard.date}
          time={wizard.time}
          values={wizard.details}
          onChange={wizard.setDetails}
          onSubmit={wizard.submitBooking}
          isSubmitting={wizard.bookingMutation.isPending}
          errorMessage={wizard.bookingMutation.error?.message ?? null}
        />
      );
    }

    if (wizard.step === 'done' && wizard.bookingMutation.data) {
      return (
        <BookingConfirmationStep
          confirmation={wizard.bookingMutation.data}
          onBookAnother={() => window.location.reload()}
        />
      );
    }

    return null;
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        {clinic?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL
          <img src={clinic.logoUrl} alt="" className={styles.logoImage} />
        ) : (
          <Logo height={22} />
        )}
        <span className={styles.clinicName}>{clinic?.name ?? ''}</span>
      </header>

      <div className={styles.card}>
        {isInitialLoading ? <p className={styles.state}>{t.loading}</p> : null}
        {initialError ? <p className={styles.state}>{t.loadError}</p> : null}

        {!isInitialLoading && !initialError ? (
          <>
            {stepIndex >= 0 ? (
              <div className={styles.stepBar}>
                {wizard.canGoBack ? (
                  <button type="button" className={styles.backButton} onClick={wizard.goBack}>
                    <ChevronLeftIcon size={16} />
                    {t.back}
                  </button>
                ) : (
                  <span />
                )}
                <span className={styles.stepCount}>
                  {format(t.stepOf, { current: stepIndex + 1, total: stepOrder.length })}
                </span>
              </div>
            ) : null}

            {renderStep()}
          </>
        ) : null}
      </div>
    </main>
  );
};
