'use client';

import { useRef } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { EMAIL_PLACEHOLDER_KEYS } from '@/common/types/email-template';
import type { Patient } from '@/common/types/patient';
import { useToast } from '@/components/providers/ToastProvider';
import {
  Alert,
  Button,
  Modal,
  PlaceholderEditor,
  type PlaceholderEditorHandle,
  RadioButton,
  SearchSelect,
} from '@/components/ui';
import { useSendPatientEmail } from '@/hooks/useSendPatientEmail';
import styles from './SendEmailModal.module.css';

type SendEmailModalProps = {
  patient: Patient;
  onClose: () => void;
  onSuccess?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const SendEmailModal = ({
  patient,
  onClose,
  onSuccess,
  className,
  style,
}: SendEmailModalProps) => {
  const { t: dict } = useTranslation();
  const t = dict.sendEmailModal;
  const { showToast } = useToast();
  const subjectRef = useRef<PlaceholderEditorHandle | null>(null);
  const bodyRef = useRef<PlaceholderEditorHandle | null>(null);

  const {
    mode,
    setMode,
    templateId,
    setTemplateId,
    subject,
    setSubject,
    body,
    setBody,
    templatesQuery,
    mutation,
    canSend,
    send,
  } = useSendPatientEmail({
    patientId: patient.id,
    onSuccess: () => {
      showToast(t.success, 'success');
      onSuccess?.();
      onClose();
    },
  });

  const templates = templatesQuery.data ?? [];
  const templateOptions = templates.map((template) => ({ value: template.id, label: template.name }));
  const submitError = mutation.error?.message ?? null;
  const hasEmail = Boolean(patient.email);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  return (
    <Modal
      title={t.title}
      closeLabel={dict.common.close}
      scrollHintLabel={dict.common.scrollForMore}
      className={className}
      style={{ maxWidth: 480, ...style }}
      onClose={onClose}
      onSubmit={handleFormSubmit}
      footer={
        <>
          <Button type="button" variant="soft" color="gray" onClick={onClose}>
            {dict.common.cancel}
          </Button>
          <Button type="submit" disabled={!hasEmail || !canSend || mutation.isPending}>
            {mutation.isPending ? t.sending : t.send}
          </Button>
        </>
      }
    >
      {!hasEmail ? <Alert color="danger">{t.noEmailError}</Alert> : null}
      {submitError ? <Alert color="danger">{submitError}</Alert> : null}

      <div className={styles.modeRow}>
        <RadioButton
          name="send-email-mode"
          value="template"
          checked={mode === 'template'}
          label={t.modeTemplate}
          onChange={() => setMode('template')}
        />
        <RadioButton
          name="send-email-mode"
          value="custom"
          checked={mode === 'custom'}
          label={t.modeCustom}
          onChange={() => setMode('custom')}
        />
      </div>

      {mode === 'template' ? (
        <div className={styles.field}>
          {templates.length === 0 && !templatesQuery.isLoading ? (
            <Alert color="gray">{t.noTemplates}</Alert>
          ) : (
            <SearchSelect
              label={t.templateLabel}
              value={templateId}
              options={templateOptions}
              placeholder={t.selectTemplatePlaceholder}
              onChange={setTemplateId}
            />
          )}
        </div>
      ) : (
        <>
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
                  {dict.emailTemplates.placeholders[key]}
                </button>
              ))}
            </div>
            <PlaceholderEditor
              ref={subjectRef}
              rows={1}
              placeholder={t.subjectPlaceholder}
              placeholderLabels={dict.emailTemplates.placeholders}
              removeLabel={dict.common.delete}
              value={subject}
              onChange={setSubject}
            />
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
                  {dict.emailTemplates.placeholders[key]}
                </button>
              ))}
            </div>
            <PlaceholderEditor
              ref={bodyRef}
              rows={5}
              placeholder={t.bodyPlaceholder}
              placeholderLabels={dict.emailTemplates.placeholders}
              removeLabel={dict.common.delete}
              value={body}
              onChange={setBody}
            />
          </div>
        </>
      )}
    </Modal>
  );
};
