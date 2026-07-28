import type {
  CreateEmailTemplatePayload,
  EmailTemplate,
  UpdateEmailTemplatePayload,
} from '@/common/types/email-template';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchEmailTemplates = (
  accessToken: string,
  signal?: AbortSignal,
): Promise<EmailTemplate[]> =>
  apiFetch<EmailTemplate[]>(accessToken, '/api/email-templates', { signal });

export const createEmailTemplate = (
  accessToken: string,
  payload: CreateEmailTemplatePayload,
): Promise<EmailTemplate> =>
  apiFetch<EmailTemplate>(accessToken, '/api/email-templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateEmailTemplate = (
  accessToken: string,
  templateId: string,
  payload: UpdateEmailTemplatePayload,
): Promise<EmailTemplate> =>
  apiFetch<EmailTemplate>(accessToken, `/api/email-templates/${templateId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteEmailTemplate = (accessToken: string, templateId: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/email-templates/${templateId}`, {
    method: 'DELETE',
  });
