export type PlatformClinicSummary = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  timezone: string;
  currency: string;
  language: string;
  isActive: boolean;
  doctorsCount: number;
  patientsCount: number;
  createdAt: string;
};

export type PlatformClinicDetail = PlatformClinicSummary & {
  totalRevenue: number;
};

export type CreateClinicAdminUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

export type CreateClinicPayload = {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  admin: CreateClinicAdminUserPayload;
};

export type UpdateClinicPayload = Partial<Omit<CreateClinicPayload, 'admin'>> & {
  isActive?: boolean;
};

export type ListPlatformClinicsParams = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
};

export type PlatformOverviewStats = {
  totalClinics: number;
  activeClinics: number;
  blockedClinics: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
};

export type PlatformRevenuePoint = {
  month: string;
  total: number;
};

export type PlatformClinicsGrowthPoint = {
  month: string;
  count: number;
};
