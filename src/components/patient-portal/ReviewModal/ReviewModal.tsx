'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { StarRatingInput } from '@/components/patient-portal/StarRatingInput/StarRatingInput';
import { Alert, Button, Modal } from '@/components/ui';
import styles from './ReviewModal.module.css';

type ReviewModalProps = {
  initialRating?: number;
  initialComment?: string | null;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
};

export const ReviewModal = ({
  initialRating = 0,
  initialComment,
  isSubmitting = false,
  errorMessage = null,
  onClose,
  onSubmit,
}: ReviewModalProps) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating < 1) {
      setValidationError(t.patientPortal.reviewRatingRequired);
      return;
    }

    setValidationError(null);
    onSubmit(rating, comment.trim());
  };

  return (
    <Modal
      title={t.patientPortal.reviewModalTitle}
      onClose={onClose}
      isLocked={isSubmitting}
      footer={
        <>
          <Button variant="soft" color="gray" onClick={onClose} disabled={isSubmitting}>
            {t.common.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {t.patientPortal.reviewSubmit}
          </Button>
        </>
      }
    >
      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {validationError ? <Alert color="danger">{validationError}</Alert> : null}

      <span className={styles.label}>{t.patientPortal.reviewRatingLabel}</span>
      <StarRatingInput rating={rating} size={28} onChange={setRating} />

      <label className={styles.label} htmlFor="review-comment">
        {t.patientPortal.reviewCommentLabel}
      </label>
      <textarea
        id="review-comment"
        className={styles.textarea}
        placeholder={t.patientPortal.reviewCommentPlaceholder}
        value={comment}
        disabled={isSubmitting}
        onChange={(event) => setComment(event.target.value)}
      />
    </Modal>
  );
};
