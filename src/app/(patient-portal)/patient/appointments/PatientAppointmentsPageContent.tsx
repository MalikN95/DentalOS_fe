'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { PatientPortalAppointment } from '@/common/types/patient-portal';
import { AppointmentCard } from '@/components/patient-portal/AppointmentCard/AppointmentCard';
import { ReviewModal } from '@/components/patient-portal/ReviewModal/ReviewModal';
import { Alert, Button, EmptyState, Modal, Tabs, type TabItem } from '@/components/ui';
import { usePortalAppointments } from '@/hooks/usePortalAppointments';
import { usePortalCancelAppointment } from '@/hooks/usePortalCancelAppointment';
import { usePortalReviews } from '@/hooks/usePortalReviews';
import { usePortalSubmitReview } from '@/hooks/usePortalSubmitReview';
import styles from './PatientAppointmentsPageContent.module.css';

export const PatientAppointmentsPageContent = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const { appointments, isLoading } = usePortalAppointments(activeTab);
  const cancelMutation = usePortalCancelAppointment();
  const { reviews } = usePortalReviews();
  const submitReviewMutation = usePortalSubmitReview();

  const [appointmentToCancel, setAppointmentToCancel] = useState<PatientPortalAppointment | null>(
    null,
  );
  const [reason, setReason] = useState('');
  const [appointmentToReview, setAppointmentToReview] = useState<PatientPortalAppointment | null>(
    null,
  );

  const tabs: TabItem[] = [
    { id: 'upcoming', label: t.patientPortal.upcomingTab },
    { id: 'past', label: t.patientPortal.pastTab },
  ];

  const emptyLabel =
    activeTab === 'upcoming' ? t.patientPortal.emptyUpcoming : t.patientPortal.emptyPast;

  const closeModal = () => {
    setAppointmentToCancel(null);
    setReason('');
    cancelMutation.reset();
  };

  const confirmCancel = () => {
    if (!appointmentToCancel) return;

    cancelMutation.mutate(
      { appointmentId: appointmentToCancel.id, reason: reason.trim() || undefined },
      { onSuccess: closeModal },
    );
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.patientPortal.appointmentsTitle}</h1>

      <Tabs items={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as 'upcoming' | 'past')} />

      <div className={styles.list}>
        {!isLoading && appointments.length === 0 ? <EmptyState title={emptyLabel} /> : null}
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            review={reviews.find((review) => review.appointmentId === appointment.id) ?? null}
            onCancel={setAppointmentToCancel}
            onReview={setAppointmentToReview}
          />
        ))}
      </div>

      {appointmentToCancel ? (
        <Modal
          title={t.patientPortal.cancelModalTitle}
          onClose={closeModal}
          isLocked={cancelMutation.isPending}
          footer={
            <>
              <Button variant="soft" color="gray" onClick={closeModal} disabled={cancelMutation.isPending}>
                {t.patientPortal.cancelDismiss}
              </Button>
              <Button color="danger" onClick={confirmCancel} disabled={cancelMutation.isPending}>
                {t.patientPortal.cancelConfirm}
              </Button>
            </>
          }
        >
          <p className={styles.modalText}>{t.patientPortal.cancelModalText}</p>

          {cancelMutation.isError ? (
            <Alert color="danger">{t.patientPortal.cancelError}</Alert>
          ) : null}

          <label className={styles.reasonLabel} htmlFor="cancel-reason">
            {t.patientPortal.cancelReasonLabel}
          </label>
          <textarea
            id="cancel-reason"
            className={styles.reasonInput}
            placeholder={t.patientPortal.cancelReasonPlaceholder}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Modal>
      ) : null}

      {appointmentToReview ? (
        <ReviewModal
          initialRating={
            reviews.find((review) => review.appointmentId === appointmentToReview.id)?.rating
          }
          initialComment={
            reviews.find((review) => review.appointmentId === appointmentToReview.id)?.comment
          }
          isSubmitting={submitReviewMutation.isPending}
          errorMessage={submitReviewMutation.isError ? t.patientPortal.reviewError : null}
          onClose={() => {
            setAppointmentToReview(null);
            submitReviewMutation.reset();
          }}
          onSubmit={(rating, comment) => {
            submitReviewMutation.mutate(
              { appointmentId: appointmentToReview.id, rating, comment: comment || undefined },
              { onSuccess: () => setAppointmentToReview(null) },
            );
          }}
        />
      ) : null}
    </div>
  );
};
