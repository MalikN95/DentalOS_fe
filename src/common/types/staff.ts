export const STAFF_ROLES = [
  'owner',
  'admin',
  'doctor',
  'receptionist',
  'assistant',
  'accountant',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type StaffDoctorServiceOption = {
  id: string;
  name: string;
};

export type StaffDoctorProfile = {
  id: string;
  branchId: string | null;
  branchName: string | null;
  specializations: string[];
  education: string[];
  experienceYears: number;
  description: string | null;
  isActive: boolean;
  acceptsOnlineBooking: boolean;
  services: StaffDoctorServiceOption[];
};

export type StaffMember = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string;
  role: StaffRole;
  isActive: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  doctorProfile: StaffDoctorProfile | null;
};

export type StaffDoctorPayload = {
  branchId?: string | null;
  specializations?: string[];
  education?: string[];
  experienceYears?: number;
  description?: string | null;
  acceptsOnlineBooking?: boolean;
  serviceIds?: string[];
};

export type CreateStaffPayload = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: StaffRole;
  password: string;
  isActive?: boolean;
  doctor?: StaffDoctorPayload;
};

export type UpdateStaffPayload = Partial<CreateStaffPayload>;

export type StaffFilter = 'all' | 'active' | 'inactive';

export type ListStaffParams = {
  page: number;
  limit: number;
  search?: string;
  role?: StaffRole;
  isActive?: boolean;
};
