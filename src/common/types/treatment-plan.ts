import type { ApiServiceOption } from './service';

export type TreatmentPlanStatus =
  'draft' | 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export type TreatmentPlanItemStatus = 'planned' | 'done' | 'skipped';

export type ApiTreatmentPlanItemService = {
  id: string;
  name: string;
};

export type ApiTreatmentPlanItem = {
  id: string;
  planId: string;
  serviceId: string;
  service: ApiTreatmentPlanItemService | null;
  toothNumber: number | null;
  price: string;
  status: TreatmentPlanItemStatus;
  sortOrder: number;
};

export type ApiTreatmentPlanDoctorProfile = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export type ApiTreatmentPlanPatient = {
  firstName: string;
  lastName: string;
};

export type ApiTreatmentPlan = {
  id: string;
  patientId: string;
  patient: ApiTreatmentPlanPatient;
  doctorProfileId: string;
  doctorProfile: ApiTreatmentPlanDoctorProfile;
  title: string;
  status: TreatmentPlanStatus;
  notes: string | null;
  createdAt: string;
  items: ApiTreatmentPlanItem[];
};

export type ListTreatmentPlansParams = {
  page: number;
  limit: number;
  patientId?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type TreatmentPlanFormOptions = {
  services: ApiServiceOption[];
  doctors: ApiTreatmentPlanDoctorProfile[];
};

export type TreatmentPlanItemPayload = {
  serviceId: string;
  toothNumber?: number;
  price?: string;
  sortOrder?: number;
};

export type CreateTreatmentPlanPayload = {
  patientId: string;
  doctorProfileId?: string;
  title: string;
  notes?: string;
  items: TreatmentPlanItemPayload[];
};

export type UpdateTreatmentPlanPayload = {
  title?: string;
  notes?: string;
  status?: TreatmentPlanStatus;
};

export type ReplaceTreatmentPlanItemsPayload = {
  items: TreatmentPlanItemPayload[];
};

/** Editable row in the items editor, before it's serialized into a payload. */
export type TreatmentPlanItemDraft = {
  key: string;
  serviceId: string;
  toothNumber: number | null;
  price: string;
};
