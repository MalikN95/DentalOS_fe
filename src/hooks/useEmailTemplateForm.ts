'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { EmailTemplate } from '@/common/types/email-template';
import { createEmailTemplate, updateEmailTemplate } from '@/helpers/email-templates.api';
import { EMAIL_TEMPLATES_QUERY_KEY } from '@/hooks/useEmailTemplates';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const emailTemplateSchema = z.object({
  name: z.string().trim().min(1, 'Укажите название').max(120),
  subject: z.string().trim().min(1, 'Укажите тему').max(200),
  body: z.string().trim().min(1, 'Укажите текст письма').max(10000),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

const EMPTY_VALUES: EmailTemplateFormValues = {
  name: '',
  subject: '',
  body: '',
};

const templateToValues = (template: EmailTemplate): EmailTemplateFormValues => ({
  name: template.name,
  subject: template.subject,
  body: template.body,
});

type UseEmailTemplateFormParams = {
  template?: EmailTemplate | null;
  onSuccess?: () => void;
};

export const useEmailTemplateForm = ({ template, onSuccess }: UseEmailTemplateFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();
  const isEditMode = Boolean(template);

  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: template ? templateToValues(template) : EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(template ? templateToValues(template) : EMPTY_VALUES);
  }, [template, reset]);

  const mutation = useMutation({
    mutationFn: (values: EmailTemplateFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      if (!template) {
        return createEmailTemplate(accessToken, values);
      }

      return updateEmailTemplate(accessToken, template.id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
      onSuccess?.();
    },
  });

  return { form, mutation, isEditMode };
};
