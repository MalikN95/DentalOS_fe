'use client';

import { useRef } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { EMAIL_PLACEHOLDER_KEYS, type EmailTemplate } from '@/common/types/email-template';
import {
  Alert,
  Button,
  Modal,
  PlaceholderEditor,
  type PlaceholderEditorHandle,
  TextField,
} from '@/components/ui';
import { useEmailTemplateForm } from '@/hooks/useEmailTemplateForm';
import styles from './EmailTemplateEditorModal.module.css';

type EmailTemplateEditorModalProps = {
  template?: EmailTemplate | null;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const EmailTemplateEditorModal = ({
  template,
  onClose,
  onSuccess,
  className,
  style,
}: EmailTemplateEditorModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.emailTemplates;
  const subjectRef = useRef<PlaceholderEditorHandle | null>(null);
  const bodyRef = useRef<PlaceholderEditorHandle | null>(null);

  const { form, mutation, isEditMode } = useEmailTemplateForm({
    template,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const submitError = mutation.error?.message ?? null;
  const submitIdleLabel = isEditMode ? t.save : t.create;

  const handleFormSubmit = handleSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <Modal
      title={isEditMode ? t.modalTitleEdit : t.modalTitleCreate}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={style}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? dict.common.saving : submitIdleLabel}
          </Button>
        </>
      }
    >
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      <div className={styles.field}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField
              label={t.name}
              placeholder={t.namePlaceholder}
              error={fieldState.error?.message}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t.subject}</span>
        <div className={styles.placeholders}>
          {EMAIL_PLACEHOLDER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={styles.placeholderButton}
              title={t.insertPlaceholder}
              onClick={() => subjectRef.current?.insertPlaceholder(key)}
            >
              {t.placeholders[key]}
            </button>
          ))}
        </div>
        <Controller
          control={control}
          name="subject"
          render={({ field, fieldState }) => (
            <PlaceholderEditor
              ref={subjectRef}
              rows={1}
              placeholder={t.subjectPlaceholder}
              placeholderLabels={t.placeholders}
              removeLabel={dict.common.delete}
              error={Boolean(fieldState.error)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.subject?.message ? (
          <span className={styles.errorText}>{errors.subject.message}</span>
        ) : null}
      </div>

      <div className={styles.field}>
        <span className={styles.label}>{t.body}</span>
        <div className={styles.placeholders}>
          {EMAIL_PLACEHOLDER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              className={styles.placeholderButton}
              title={t.insertPlaceholder}
              onClick={() => bodyRef.current?.insertPlaceholder(key)}
            >
              {t.placeholders[key]}
            </button>
          ))}
        </div>
        <Controller
          control={control}
          name="body"
          render={({ field, fieldState }) => (
            <PlaceholderEditor
              ref={bodyRef}
              rows={8}
              placeholder={t.bodyPlaceholder}
              placeholderLabels={t.placeholders}
              removeLabel={dict.common.delete}
              error={Boolean(fieldState.error)}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {errors.body?.message ? (
          <span className={styles.errorText}>{errors.body.message}</span>
        ) : null}
      </div>
    </Modal>
  );
};
