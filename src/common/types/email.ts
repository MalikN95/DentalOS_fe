export type SendPatientEmailPayload =
  | { mode: 'template'; templateId: string }
  | { mode: 'custom'; subject: string; body: string };
