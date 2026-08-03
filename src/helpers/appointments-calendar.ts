import type { AppointmentsViewMode } from '@/common/types/appointment';
import { getWeekDays } from '@/helpers/date';

// The header label shown next to the prev/next controls — one line per view,
// e.g. "14 июня" (day), "10 – 16 июня 2026" (week), "Июнь 2026" (month), "2026" (year).
export const formatCalendarPeriodLabel = (
  viewMode: AppointmentsViewMode,
  date: Date,
  language: string,
): string => {
  switch (viewMode) {
    case 'day':
      return date.toLocaleDateString(language, { day: 'numeric', month: 'long', weekday: 'short' });

    case 'week': {
      const days = getWeekDays(date);
      const start = days[0];
      const end = days[6];
      const sameMonth =
        start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
      const startLabel = start.toLocaleDateString(
        language,
        sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' },
      );
      const endLabel = end.toLocaleDateString(language, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `${startLabel} – ${endLabel}`;
    }

    case 'month':
      return date.toLocaleDateString(language, { month: 'long', year: 'numeric' });

    case 'year':
    default:
      return String(date.getFullYear());
  }
};
