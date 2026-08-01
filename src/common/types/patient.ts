import type { PatientTag } from './patient-tag';

export type Gender = 'male' | 'female' | 'other';

export type PatientInsurance = {
  company: string;
  policyNumber: string;
  validUntil: string | null; // 'YYYY-MM-DD'
};

export type PatientNotificationPreferences = {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
};

// The staff-facing patient form only ever edits email/whatsapp — `push` can
// only be granted from the patient's own browser (booking widget), so it's
// never part of what this form sends.
export type PatientNotificationPreferencesInput = {
  email: boolean;
  whatsapp: boolean;
};

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  birthDate: string | null; // 'YYYY-MM-DD'
  gender: Gender | null;
  insurance: PatientInsurance | null;
  allergies: string[];
  chronicDiseases: string[];
  comments: string | null;
  isActive: boolean;
  tags: PatientTag[];
  notificationPreferences: PatientNotificationPreferences;
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  gender?: Gender;
  insurance?: PatientInsurance;
  allergies?: string[];
  chronicDiseases?: string[];
  comments?: string;
  notificationPreferences?: PatientNotificationPreferencesInput;
};

export type UpdatePatientPayload = Partial<CreatePatientPayload> & {
  isActive?: boolean;
};

export type PatientsFilter = 'all' | 'active' | 'inactive';

export type ListPatientsParams = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  createdFrom?: string;
  createdTo?: string;
  tagIds?: string[];
};
