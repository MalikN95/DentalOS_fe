'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { BookingDoctor } from '@/common/types/booking';
import { BookingDoctorSummary } from '@/components/booking/BookingDoctorSummary/BookingDoctorSummary';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/icons';
import { toDateInputValue } from '@/helpers/date';
import styles from './BookingDateTimeStep.module.css';

type BookingDateTimeStepProps = {
  doctor: BookingDoctor;
  month: Date;
  canGoPrevMonth: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  availableDays: string[];
  isLoadingDays: boolean;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  slots: string[];
  isLoadingSlots: boolean;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

const formatMonthTitle = (date: Date): string => {
  const label = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatWeekdayLabel = (date: Date): string => {
  const label = date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// Monday-first weeks covering the full month, padded with nulls for the
// leading/trailing days that belong to adjacent months.
const buildMonthWeeks = (month: Date): (Date | null)[][] => {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return weeks;
};

const WEEKDAY_SAMPLE_DATES = [5, 6, 7, 8, 9, 10, 11].map((day) => new Date(2026, 0, day));

export const BookingDateTimeStep = ({
  doctor,
  month,
  canGoPrevMonth,
  onPrevMonth,
  onNextMonth,
  availableDays,
  isLoadingDays,
  selectedDate,
  onSelectDate,
  slots,
  isLoadingSlots,
  selectedTime,
  onSelectTime,
}: BookingDateTimeStepProps) => {
  const { t: dict } = useTranslation();
  const t = dict.booking;
  const availableDaysSet = new Set(availableDays);
  const weeks = buildMonthWeeks(month);
  const today = toDateInputValue(new Date());

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>{t.dateTimeTitle}</h1>

      <BookingDoctorSummary doctor={doctor} />

      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <button
            type="button"
            className={styles.navButton}
            disabled={!canGoPrevMonth}
            onClick={onPrevMonth}
            aria-label={t.back}
          >
            <ChevronLeftIcon size={16} />
          </button>
          <span className={styles.monthLabel}>{formatMonthTitle(month)}</span>
          <button
            type="button"
            className={styles.navButton}
            onClick={onNextMonth}
            aria-label={t.dateTimeTitle}
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>

        <div className={styles.weekdays}>
          {WEEKDAY_SAMPLE_DATES.map((date) => (
            <span key={date.getDay()} className={styles.weekday}>
              {formatWeekdayLabel(date)}
            </span>
          ))}
        </div>

        {isLoadingDays ? (
          <span className={styles.state}>{t.loading}</span>
        ) : (
          <div className={styles.weeks}>
            {weeks.map((week, weekIndex) => (
              // eslint-disable-next-line react/no-array-index-key -- weeks never reorder within a render
              <div key={weekIndex} className={styles.week}>
                {week.map((day, dayIndex) => {
                  if (!day) {
                    // eslint-disable-next-line react/no-array-index-key -- fixed 7-wide grid, never reordered
                    return <span key={dayIndex} className={styles.dayEmpty} />;
                  }

                  const value = toDateInputValue(day);
                  const isPast = value < today;
                  const isAvailable = !isPast && availableDaysSet.has(value);

                  return (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.day} ${isAvailable ? styles.dayAvailable : ''} ${
                        value === selectedDate ? styles.daySelected : ''
                      }`}
                      disabled={!isAvailable}
                      onClick={() => onSelectDate(value)}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {!isLoadingDays && availableDays.length === 0 ? (
          <p className={styles.empty}>{t.noDaysInMonth}</p>
        ) : null}
      </div>

      <div className={styles.slots}>
        {!selectedDate ? <p className={styles.empty}>{t.selectDateFirst}</p> : null}

        {selectedDate && isLoadingSlots ? <span className={styles.state}>{t.loading}</span> : null}

        {selectedDate && !isLoadingSlots && slots.length === 0 ? (
          <p className={styles.empty}>{t.noSlotsForDay}</p>
        ) : null}

        {selectedDate && !isLoadingSlots && slots.length > 0 ? (
          <div className={styles.slotGrid}>
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className={`${styles.slot} ${slot === selectedTime ? styles.slotSelected : ''}`}
                onClick={() => onSelectTime(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
