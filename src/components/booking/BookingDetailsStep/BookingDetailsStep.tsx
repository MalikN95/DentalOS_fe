'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingBranch, BookingDoctor, BookingService } from '@/common/types/booking';
import type { PatientDetailsValues } from '@/hooks/useBookingWizard';
import { Alert, Button, Checkbox, TextField } from '@/components/ui';
import { formatMoney } from '@/helpers/appointment-status';
import { parseDateInputValue } from '@/helpers/date';
import styles from './BookingDetailsStep.module.css';

type BookingDetailsStepProps = {
  branch: BookingBranch;
  service: BookingService;
  doctor: BookingDoctor;
  currency: string;
  date: string;
  time: string;
  values: PatientDetailsValues;
  onChange: (values: PatientDetailsValues) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
};

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'phone' | 'email', string>>;

const PHONE_PATTERN = /^\+?[0-9()\-\s]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const BookingDetailsStep = ({
  branch,
  service,
  doctor,
  currency,
  date,
  time,
  values,
  onChange,
  onSubmit,
  isSubmitting,
  errorMessage,
}: BookingDetailsStepProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;
  const [errors, setErrors] = useState<FieldErrors>({});
  const commentFieldId = useId();

  const doctorName = `${doctor.firstName} ${doctor.lastName}`.trim();
  const displayDate = parseDateInputValue(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleField = (field: keyof PatientDetailsValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...values, [field]: event.target.value });
  };

  const validate = (): FieldErrors => {
    const nextErrors: FieldErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = t.required;
    if (!values.lastName.trim()) nextErrors.lastName = t.required;

    const phone = values.phone.trim();
    if (!phone) nextErrors.phone = t.required;
    else if (!PHONE_PATTERN.test(phone)) nextErrors.phone = t.invalidPhone;

    const email = values.email.trim();
    if (email && !EMAIL_PATTERN.test(email)) nextErrors.email = t.invalidEmail;

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t.detailsTitle}</h1>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t.summaryBranch}</span>
          <span>{branch.name}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t.summaryService}</span>
          <span>
            {service.name} · {formatMoney(service.price, currency)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t.summaryDoctor}</span>
          <span>{doctorName}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>{t.summaryDateTime}</span>
          <span>
            {displayDate}, {time}
          </span>
        </div>
      </div>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          <TextField
            label={t.firstName}
            error={errors.firstName}
            value={values.firstName}
            onChange={handleField('firstName')}
          />
          <TextField
            label={t.lastName}
            error={errors.lastName}
            value={values.lastName}
            onChange={handleField('lastName')}
          />
          <TextField
            label={t.phone}
            placeholder="+79001234567"
            error={errors.phone}
            value={values.phone}
            onChange={handleField('phone')}
          />
          <TextField
            label={t.email}
            type="email"
            placeholder={t.emailOptional}
            error={errors.email}
            value={values.email}
            onChange={handleField('email')}
          />
        </div>

        <label className={styles.field} htmlFor={commentFieldId}>
          <span className={styles.label}>{t.comment}</span>
          <textarea
            id={commentFieldId}
            className={styles.textarea}
            placeholder={t.commentPlaceholder}
            value={values.comment}
            onChange={(event) => onChange({ ...values, comment: event.target.value })}
          />
        </label>

        <fieldset className={styles.notifications}>
          <legend className={styles.label}>{t.notificationsTitle}</legend>
          <Checkbox
            checked={values.notifyEmail}
            label={t.notifyEmail}
            onChange={(checked) => onChange({ ...values, notifyEmail: checked })}
          />
          <Checkbox
            checked={values.notifyWhatsapp}
            label={t.notifyWhatsapp}
            onChange={(checked) => onChange({ ...values, notifyWhatsapp: checked })}
          />
          <Checkbox
            checked={values.notifyPush}
            label={t.notifyPushHint}
            onChange={(checked) => onChange({ ...values, notifyPush: checked })}
          />
        </fieldset>

        <Button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? t.submitting : t.submit}
        </Button>
      </form>
    </div>
  );
};
