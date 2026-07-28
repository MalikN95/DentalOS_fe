'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { SendPatientEmailPayload } from '@/common/types/email';
import { fetchEmailTemplates } from '@/helpers/email-templates.api';
import { sendPatientEmail } from '@/helpers/emails.api';
import { EMAIL_TEMPLATES_QUERY_KEY } from '@/hooks/useEmailTemplates';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export type SendEmailMode = 'template' | 'custom';

type UseSendPatientEmailParams = {
  patientId: string;
  onSuccess?: () => void;
};

export const useSendPatientEmail = ({ patientId, onSuccess }: UseSendPatientEmailParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const [mode, setMode] = useState<SendEmailMode>('template');
  const [templateId, setTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const templatesQuery = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchEmailTemplates(accessToken, signal);
    },
    enabled: Boolean(accessToken) && mode === 'template',
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const payload: SendPatientEmailPayload =
        mode === 'template'
          ? { mode: 'template', templateId }
          : { mode: 'custom', subject: subject.trim(), body: body.trim() };

      return sendPatientEmail(accessToken, patientId, payload);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const canSend =
    mode === 'template' ? templateId.length > 0 : subject.trim().length > 0 && body.trim().length > 0;

  const send = () => {
    if (canSend) {
      mutation.mutate();
    }
  };

  return {
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
  };
};
