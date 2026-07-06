export type DaySchedule = {
  from: string;
  to: string;
} | null;

export type WorkingHours = {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
};

export const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  mon: 'Понедельник',
  tue: 'Вторник',
  wed: 'Среда',
  thu: 'Четверг',
  fri: 'Пятница',
  sat: 'Суббота',
  sun: 'Воскресенье',
};

export type ClinicSettings = {
  id: string;
  name: string;
  subdomain: string;
  logoKey: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  workingHours: WorkingHours | null;
  timezone: string;
  currency: string;
  language: string;
  isActive: boolean;
};

export type UpdateClinicPayload = {
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: WorkingHours;
  timezone?: string;
  currency?: string;
  language?: string;
  logoKey?: string;
  isActive?: boolean;
};

export type BranchSettings = {
  id: string;
  name: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  phone: string | null;
  workingHours: WorkingHours | null;
  isActive: boolean;
};

export type CreateBranchPayload = {
  name: string;
  address: string;
  latitude?: string;
  longitude?: string;
  phone?: string;
  workingHours?: WorkingHours;
  isActive?: boolean;
};
