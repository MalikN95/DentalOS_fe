'use client';

import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation } from '@/common/locale/LocaleProvider';
import {
  SCHEDULE_EXCEPTION_TYPES,
  type ApiScheduleException,
  type CreateScheduleExceptionInput,
  type ScheduleExceptionType,
} from '@/common/types/schedule';
import { Alert, Button, Modal, TextField } from '@/components/ui';
import { scheduleExceptionTypeColor } from '@/helpers/schedule-exception';
import { toDateInputValue } from '@/helpers/date';
import styles from './ScheduleExceptionModal.module.css';

type ScheduleExceptionModalProps = {
  onClose: () => void;
  createMutation: UseMutationResult<ApiScheduleException, Error, CreateScheduleExceptionInput>;
};

export const ScheduleExceptionModal = ({
  onClose,
  createMutation,
}: ScheduleExceptionModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.scheduleExceptions;
  const today = toDateInputValue(new Date());
  const [type, setType] = useState<ScheduleExceptionType>('vacation');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [comment, setComment] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (dateFrom > dateTo) {
      setValidationError(t.dateRangeInvalid);
      return;
    }

    setValidationError(null);
    createMutation.mutate(
      { type, dateFrom, dateTo, comment: comment.trim() || undefined },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      title={t.addTitle}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      isLocked={createMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? dict.common.saving : t.add}
          </Button>
        </>
      }
    >
      {validationError ? <Alert color="danger">{validationError}</Alert> : null}
      {createMutation.error ? <Alert color="danger">{createMutation.error.message}</Alert> : null}

      <div className={styles.field}>
        <span className={styles.label}>{t.typeLabel}</span>
        <div className={styles.typeRow}>
          {SCHEDULE_EXCEPTION_TYPES.map((option) => (
            <button
              key={option}
              type="button"
              className={`${styles.typeOption} ${type === option ? styles.typeOptionActive : ''}`}
              data-color={scheduleExceptionTypeColor[option]}
              onClick={() => setType(option)}
            >
              {t.type[option]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dateRow}>
        <TextField
          label={t.dateFrom}
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <TextField
          label={t.dateTo}
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <TextField
          label={t.commentLabel}
          placeholder={t.commentPlaceholder}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
    </Modal>
  );
};
