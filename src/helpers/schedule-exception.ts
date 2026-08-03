import type { ScheduleExceptionType } from '@/common/types/schedule';
import type { BadgeColor } from '@/components/ui';

export const scheduleExceptionTypeColor: Record<ScheduleExceptionType, BadgeColor> = {
  vacation: 'primary',
  sick_leave: 'danger',
  holiday: 'success',
  day_off: 'gray',
};
