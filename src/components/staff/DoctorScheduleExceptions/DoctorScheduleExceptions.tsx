'use client';

import { useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiScheduleException } from '@/common/types/schedule';
import { ScheduleExceptionModal } from '@/components/staff/ScheduleExceptionModal/ScheduleExceptionModal';
import { TrashIcon } from '@/components/icons/icons';
import { Alert, Badge, Button } from '@/components/ui';
import { parseDateInputValue } from '@/helpers/date';
import { scheduleExceptionTypeColor } from '@/helpers/schedule-exception';
import { useDoctorScheduleExceptions } from '@/hooks/useDoctorScheduleExceptions';
import styles from './DoctorScheduleExceptions.module.css';

type DoctorScheduleExceptionsProps = {
  doctorProfileId: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const DoctorScheduleExceptions = ({
  doctorProfileId,
  readOnly = false,
  className,
  style,
}: DoctorScheduleExceptionsProps) => {
  const { t: dict, language } = useTranslation();
  const t = dict.scheduleExceptions;
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { exceptions, isLoading, errorMessage, createMutation, deleteMutation } =
    useDoctorScheduleExceptions(doctorProfileId);

  const formatRangeDate = (value: string) =>
    parseDateInputValue(value).toLocaleDateString(language, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const handleDelete = (exception: ApiScheduleException) => {
    const range = `${formatRangeDate(exception.dateFrom)} – ${formatRangeDate(exception.dateTo)}`;
    // eslint-disable-next-line no-alert -- simple delete confirmation
    const confirmed = window.confirm(format(t.confirmDelete, { range }));

    if (!confirmed) return;
    deleteMutation.mutate(exception.id);
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <p className={styles.description}>{t.description}</p>
        {!readOnly ? (
          <Button variant="soft" onClick={() => setIsAddOpen(true)}>
            {t.add}
          </Button>
        ) : null}
      </div>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {deleteMutation.error ? <Alert color="danger">{deleteMutation.error.message}</Alert> : null}

      {isLoading ? <p className={styles.hint}>{dict.common.loading}</p> : null}

      {!isLoading && exceptions.length === 0 ? <p className={styles.hint}>{t.empty}</p> : null}

      {!isLoading && exceptions.length > 0 ? (
        <ul className={styles.list}>
          {exceptions.map((exception) => (
            <li key={exception.id} className={styles.row}>
              <Badge color={scheduleExceptionTypeColor[exception.type]}>
                {t.type[exception.type]}
              </Badge>
              <span className={styles.range}>
                {formatRangeDate(exception.dateFrom)} – {formatRangeDate(exception.dateTo)}
              </span>
              {exception.comment ? (
                <span className={styles.comment}>{exception.comment}</span>
              ) : null}
              {!readOnly ? (
                <button
                  type="button"
                  className={styles.deleteButton}
                  aria-label={t.delete}
                  title={t.delete}
                  disabled={deleteMutation.isPending}
                  onClick={() => handleDelete(exception)}
                >
                  <TrashIcon size={14} />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {isAddOpen ? (
        <ScheduleExceptionModal
          onClose={() => setIsAddOpen(false)}
          createMutation={createMutation}
        />
      ) : null}
    </div>
  );
};
