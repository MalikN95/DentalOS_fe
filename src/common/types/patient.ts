export type Gender = 'male' | 'female' | 'other';

export type PatientInsurance = {
  company: string;
  policyNumber: string;
  validUntil: string | null; // 'YYYY-MM-DD'
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
};
