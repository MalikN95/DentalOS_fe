export type ApiDoctorScheduleSlot = {
  id: string;
  doctorProfileId: string;
  branchId: string;
  /** 0 = Monday ... 6 = Sunday */
  weekday: number;
  /** 'HH:mm', clinic-local time */
  startTime: string;
  endTime: string;
};

export type ScheduleSlotInput = {
  branchId: string;
  weekday: number;
  startTime: string;
  endTime: string;
};

export type ScheduleExceptionType = 'vacation' | 'sick_leave' | 'holiday' | 'day_off';

export const SCHEDULE_EXCEPTION_TYPES: ScheduleExceptionType[] = [
  'vacation',
  'sick_leave',
  'holiday',
  'day_off',
];

// Blocks booking for the doctor over an inclusive date range.
export type ApiScheduleException = {
  id: string;
  doctorProfileId: string;
  type: ScheduleExceptionType;
  /** 'YYYY-MM-DD', inclusive */
  dateFrom: string;
  /** 'YYYY-MM-DD', inclusive */
  dateTo: string;
  comment: string | null;
};

export type CreateScheduleExceptionInput = {
  type: ScheduleExceptionType;
  dateFrom: string;
  dateTo: string;
  comment?: string;
};
