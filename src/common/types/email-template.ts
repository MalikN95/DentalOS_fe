export const EMAIL_PLACEHOLDER_KEYS = [
  'patientFirstName',
  'patientLastName',
  'clinicName',
  'clinicPhone',
  'clinicAddress',
] as const;

export type EmailPlaceholderKey = (typeof EMAIL_PLACEHOLDER_KEYS)[number];

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmailTemplatePayload = {
  name: string;
  subject: string;
  body: string;
};

export type UpdateEmailTemplatePayload = Partial<CreateEmailTemplatePayload>;
