import type { PaymentMethod } from '@/common/types/finance';

export type RevenueByDayItem = {
  date: string;
  amount: number;
};

export type RevenueByMethodItem = {
  method: PaymentMethod;
  amount: number;
};

export type RevenueAnalytics = {
  totalPaid: number;
  totalRefunded: number;
  net: number;
  byDay: RevenueByDayItem[];
  byMethod: RevenueByMethodItem[];
};

export type DoctorLoadItem = {
  doctorProfileId: string;
  doctorName: string;
  appointmentsCount: number;
  minutesBooked: number;
};

export type TopServiceItem = {
  serviceId: string;
  name: string;
  count: number;
  revenue: number;
};

export type CancellationsAnalytics = {
  cancelled: number;
  noShow: number;
  total: number;
  cancellationRate: number;
  noShowRate: number;
};

export type RepeatVisitsAnalytics = {
  totalPatients: number;
  repeatPatients: number;
  rate: number;
};

export type GenderBreakdownItem = {
  gender: 'male' | 'female' | 'other' | 'unknown';
  count: number;
};

export type AgeGroupBreakdownItem = {
  group: '0-17' | '18-34' | '35-54' | '55+' | 'unknown';
  count: number;
};

export type PatientDemographics = {
  totalPatients: number;
  byGender: GenderBreakdownItem[];
  byAgeGroup: AgeGroupBreakdownItem[];
};
