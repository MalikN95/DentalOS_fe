import type { WorkingHours, WeekdayKey } from '@/common/types/settings';
import { WEEKDAY_KEYS } from '@/common/types/settings';

export const DEFAULT_WORKING_HOURS: WorkingHours = {
  mon: { from: '09:00', to: '18:00' },
  tue: { from: '09:00', to: '18:00' },
  wed: { from: '09:00', to: '18:00' },
  thu: { from: '09:00', to: '18:00' },
  fri: { from: '09:00', to: '18:00' },
  sat: null,
  sun: null,
};

export const normalizeWorkingHours = (value: WorkingHours | null | undefined): WorkingHours => {
  if (!value) {
    return { ...DEFAULT_WORKING_HOURS };
  }

  return WEEKDAY_KEYS.reduce<WorkingHours>(
    (acc, day) => ({
      ...acc,
      [day]: value[day] ?? null,
    }),
    {} as WorkingHours,
  );
};

export const toggleWorkingDay = (
  hours: WorkingHours,
  day: WeekdayKey,
  isOpen: boolean,
): WorkingHours => ({
  ...hours,
  [day]: isOpen ? { from: '09:00', to: '18:00' } : null,
});

export const updateWorkingDayTime = (
  hours: WorkingHours,
  day: WeekdayKey,
  field: 'from' | 'to',
  value: string,
): WorkingHours => {
  const current = hours[day];

  if (!current) {
    return hours;
  }

  return {
    ...hours,
    [day]: {
      ...current,
      [field]: value,
    },
  };
};
