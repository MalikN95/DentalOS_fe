'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { AppointmentsViewMode } from '@/common/types/appointment';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/icons';
import { Tabs } from '@/components/ui';
import { formatCalendarPeriodLabel } from '@/helpers/appointments-calendar';
import { parseDateInputValue, toDateInputValue } from '@/helpers/date';
import styles from './AppointmentsCalendarNav.module.css';

type AppointmentsCalendarNavProps = {
  viewMode: AppointmentsViewMode;
  onViewModeChange: (mode: AppointmentsViewMode) => void;
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (date: Date) => void;
  className?: string;
};

export const AppointmentsCalendarNav = ({
  viewMode,
  onViewModeChange,
  date,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
  className,
}: AppointmentsCalendarNavProps) => {
  const { t, language } = useTranslation();

  const viewItems = [
    { id: 'day', label: t.appointments.viewDay },
    { id: 'week', label: t.appointments.viewWeek },
    { id: 'month', label: t.appointments.viewMonth },
    { id: 'year', label: t.appointments.viewYear },
  ];

  return (
    <div className={`${styles.bar} ${className ?? ''}`}>
      <div className={styles.dateNav}>
        <button
          type="button"
          className={styles.navButton}
          onClick={onPrev}
          aria-label={t.appointments.prevPeriod}
        >
          <ChevronLeftIcon size={16} />
        </button>
        <span className={styles.dateLabel}>
          {formatCalendarPeriodLabel(viewMode, date, language)}
        </span>
        <button
          type="button"
          className={styles.navButton}
          onClick={onNext}
          aria-label={t.appointments.nextPeriod}
        >
          <ChevronRightIcon size={16} />
        </button>

        <button type="button" className={styles.todayButton} onClick={onToday}>
          {t.appointments.today}
        </button>

        <span className={styles.calendarTrigger}>
          <CalendarIcon size={15} className={styles.calendarIcon} />
          <input
            type="date"
            className={styles.calendarInput}
            value={toDateInputValue(date)}
            aria-label={t.appointments.pickDate}
            onChange={(event) => {
              if (event.target.value) {
                onSelectDate(parseDateInputValue(event.target.value));
              }
            }}
          />
        </span>
      </div>

      <Tabs
        items={viewItems}
        activeId={viewMode}
        className={styles.tabsRow}
        onChange={(id) => onViewModeChange(id as AppointmentsViewMode)}
      />
    </div>
  );
};
