'use client';

import type { WorkingHours, WeekdayKey } from '@/common/types/settings';
import { WEEKDAY_KEYS } from '@/common/types/settings';
import { useTranslation } from '@/common/locale/LocaleProvider';
import {
  normalizeWorkingHours,
  toggleWorkingDay,
  updateWorkingDayTime,
} from '@/helpers/working-hours';
import { Checkbox, TimeSelect } from '@/components/ui';
import styles from './WorkingHoursEditor.module.css';

type WorkingHoursEditorProps = {
  value: WorkingHours;
  onChange: (value: WorkingHours) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const WorkingHoursEditor = ({
  value,
  onChange,
  disabled = false,
  className,
  style,
}: WorkingHoursEditorProps) => {
  const { t } = useTranslation();
  const hours = normalizeWorkingHours(value);

  const handleToggleDay = (day: WeekdayKey, isOpen: boolean) => {
    onChange(toggleWorkingDay(hours, day, isOpen));
  };

  const handleTimeChange = (day: WeekdayKey, field: 'from' | 'to', time: string) => {
    onChange(updateWorkingDayTime(hours, day, field, time));
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {WEEKDAY_KEYS.map((day) => {
        const schedule = hours[day];
        const isOpen = schedule !== null;

        return (
          <div key={day} className={styles.row}>
            <Checkbox
              label={t.weekdays[day]}
              checked={isOpen}
              disabled={disabled}
              onChange={(checked) => handleToggleDay(day, checked)}
            />
            <TimeSelect
              value={schedule?.from ?? '09:00'}
              disabled={disabled || !isOpen}
              onChange={(time) => handleTimeChange(day, 'from', time)}
            />
            <span className={styles.separator}>—</span>
            <TimeSelect
              value={schedule?.to ?? '18:00'}
              disabled={disabled || !isOpen}
              onChange={(time) => handleTimeChange(day, 'to', time)}
            />
          </div>
        );
      })}
    </div>
  );
};
