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
