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

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

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
