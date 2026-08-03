export const getDayIsoRange = (date: Date): { from: string; to: string } => {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

export const getTodayIsoRange = (): { from: string; to: string } => getDayIsoRange(new Date());

export const getMonthIsoRange = (date: Date): { from: string; to: string } => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const addWeeks = (date: Date, amount: number): Date => addDays(date, amount * 7);

// setMonth()/setFullYear() roll over into the wrong month when the current
// day doesn't exist there (Jan 31 + 1 month lands on Mar 3, not Feb 28) —
// clamp to the target month's last day instead.
export const addMonths = (date: Date, amount: number): Date => {
  const targetMonth = date.getMonth() + amount;
  const daysInTargetMonth = new Date(date.getFullYear(), targetMonth + 1, 0).getDate();
  const day = Math.min(date.getDate(), daysInTargetMonth);
  return new Date(date.getFullYear(), targetMonth, day);
};

export const addYears = (date: Date, amount: number): Date => addMonths(date, amount * 12);

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Monday-start week, matching the ru locale's week convention used elsewhere (weekdaysShort).
export const startOfWeek = (date: Date): Date => {
  const start = startOfDay(date);
  const weekday = start.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(start, mondayOffset);
};

export const getWeekDays = (date: Date): Date[] => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
};

export const getWeekIsoRange = (date: Date): { from: string; to: string } => {
  const days = getWeekDays(date);
  return {
    from: startOfDay(days[0]).toISOString(),
    to: new Date(
      days[6].getFullYear(),
      days[6].getMonth(),
      days[6].getDate(),
      23,
      59,
      59,
      999,
    ).toISOString(),
  };
};

// Weeks (Monday-start) covering the full month, including the leading/trailing
// days from adjacent months needed to keep every row a full 7 days.
export const getMonthMatrix = (date: Date): Date[][] => {
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const gridStart = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1));
  const weeks: Date[][] = [];

  for (let weekIndex = 0; ; weekIndex += 1) {
    const weekStart = addDays(gridStart, weekIndex * 7);
    if (weekStart > lastOfMonth) break;
    weeks.push(Array.from({ length: 7 }, (_, dayIndex) => addDays(weekStart, dayIndex)));
  }

  return weeks;
};

export const getYearMonths = (date: Date): Date[] =>
  Array.from({ length: 12 }, (_, month) => new Date(date.getFullYear(), month, 1));

const DAY_MS = 24 * 60 * 60 * 1000;

// Whole calendar days between two dates (time-of-day ignored), positive when `to` is later.
export const daysBetween = (from: Date, to: Date): number =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);

// 'YYYY-MM-DD' in local time, for <input type="date"> value/onChange — avoids
// the UTC-shift bugs that toISOString() would introduce.
export const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateInputValue = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatTime = (isoDate: string): string =>
  new Date(isoDate).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// Whole years since birthDate ('YYYY-MM-DD'), null when there's nothing to compute.
export const calculateAge = (birthDate: string | null): number | null => {
  if (!birthDate) return null;

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasHadBirthdayThisYear) age -= 1;

  return age;
};

// Short, capitalized month name (e.g. "Янв", "Март") for compact axis labels —
// Intl's own 'short' style trails a period ("янв.") that reads oddly that small.
export const formatMonthLabel = (date: Date): string => {
  const short = date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
  return short.charAt(0).toUpperCase() + short.slice(1);
};
