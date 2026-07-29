import type { ApiDoctorScheduleSlot, ScheduleSlotInput } from '@/common/types/schedule';
import type { WorkingHours } from '@/common/types/settings';
import { WEEKDAY_KEYS } from '@/common/types/settings';

/** Slots for other branches are dropped — the editor manages one branch's hours at a time. */
export const slotsToWorkingHours = (
  slots: ApiDoctorScheduleSlot[],
  branchId: string,
): WorkingHours =>
  WEEKDAY_KEYS.reduce<WorkingHours>((acc, day, weekday) => {
    const slot = slots.find((item) => item.branchId === branchId && item.weekday === weekday);
    return {
      ...acc,
      [day]: slot ? { from: slot.startTime, to: slot.endTime } : null,
    };
  }, {} as WorkingHours);

export const workingHoursToSlots = (hours: WorkingHours, branchId: string): ScheduleSlotInput[] =>
  WEEKDAY_KEYS.reduce<ScheduleSlotInput[]>((slots, day, weekday) => {
    const schedule = hours[day];
    if (!schedule) return slots;

    return [...slots, { branchId, weekday, startTime: schedule.from, endTime: schedule.to }];
  }, []);
