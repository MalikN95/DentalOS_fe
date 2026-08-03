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
  maxAdvanceBookingDays: number | null;
  services: StaffDoctorServiceOption[];
};

export type StaffNotificationPreferences = {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
  inApp: boolean;
  reviewAlertMaxRating: number;
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
  notificationPreferences: StaffNotificationPreferences;
  doctorProfile: StaffDoctorProfile | null;
};

export type StaffDoctorPayload = {
  branchId?: string | null;
  specializations?: string[];
  education?: string[];
  experienceYears?: number;
  description?: string | null;
  acceptsOnlineBooking?: boolean;
  maxAdvanceBookingDays?: number | null;
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
  notificationPreferences?: StaffNotificationPreferences;
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
