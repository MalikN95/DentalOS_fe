'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiDoctorScheduleSlot, ScheduleSlotInput } from '@/common/types/schedule';
import {
  WEEKDAY_KEYS,
  type BranchSettings,
  type WeekdayKey,
  type WorkingHours,
} from '@/common/types/settings';
import { useToast } from '@/components/providers/ToastProvider';
import { Button, Checkbox, TimeSelect } from '@/components/ui';
import { slotsToWorkingHours, workingHoursToSlots } from '@/helpers/doctor-schedule';
import { normalizeWorkingHours, toggleWorkingDay, updateWorkingDayTime } from '@/helpers/working-hours';
import { useBranchOptions } from '@/hooks/useBranchOptions';
import { useDoctorSchedule } from '@/hooks/useDoctorSchedule';
import styles from './DoctorScheduleSection.module.css';

type DoctorScheduleSectionProps = {
  doctorProfileId: string;
  /** The doctor's primary branch, if any — just used to list it first. */
  branchId: string | null;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const timeToMinutes = (value: string): number => {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const rangesOverlap = (aFrom: string, aTo: string, bFrom: string, bTo: string): boolean =>
  timeToMinutes(aFrom) < timeToMinutes(bTo) && timeToMinutes(bFrom) < timeToMinutes(aTo);

/** `${branchId}:${weekday}` keys of every branch/day whose hours overlap another
 *  branch's hours on the same weekday — a doctor can work several branches on the
 *  same day, but not literally at two places at once. */
const findConflictKeys = (
  branches: BranchSettings[],
  hoursByBranch: Record<string, WorkingHours>,
): Set<string> => {
  const keys = new Set<string>();

  WEEKDAY_KEYS.forEach((day) => {
    const openEntries = branches
      .map((branch) => ({ branchId: branch.id, schedule: hoursByBranch[branch.id]?.[day] ?? null }))
      .filter((entry) => entry.schedule !== null) as { branchId: string; schedule: { from: string; to: string } }[];

    for (let i = 0; i < openEntries.length; i += 1) {
      for (let j = i + 1; j < openEntries.length; j += 1) {
        const a = openEntries[i];
        const b = openEntries[j];

        if (rangesOverlap(a.schedule.from, a.schedule.to, b.schedule.from, b.schedule.to)) {
          keys.add(`${a.branchId}:${day}`);
          keys.add(`${b.branchId}:${day}`);
        }
      }
    }
  });

  return keys;
};

type BranchesGridProps = {
  branches: BranchSettings[];
  initialSlots: ApiDoctorScheduleSlot[];
  readOnly: boolean;
  isSaving: boolean;
  onSave: (slots: ScheduleSlotInput[]) => void;
};

/** Keyed by doctorProfileId from the parent, so switching doctors remounts with
 *  fresh data instead of needing an effect to re-derive local state from props. */
const BranchesGrid = ({ branches, initialSlots, readOnly, isSaving, onSave }: BranchesGridProps) => {
  const { t } = useTranslation();
  const [hoursByBranch, setHoursByBranch] = useState<Record<string, WorkingHours>>(() =>
    Object.fromEntries(
      branches.map((branch) => [branch.id, slotsToWorkingHours(initialSlots, branch.id)]),
    ),
  );

  const conflictKeys = findConflictKeys(branches, hoursByBranch);

  const handleToggleDay = (branchId: string, day: WeekdayKey, isOpen: boolean) => {
    setHoursByBranch((prev) => ({
      ...prev,
      [branchId]: toggleWorkingDay(normalizeWorkingHours(prev[branchId]), day, isOpen),
    }));
  };

  const handleTimeChange = (
    branchId: string,
    day: WeekdayKey,
    field: 'from' | 'to',
    value: string,
  ) => {
    setHoursByBranch((prev) => ({
      ...prev,
      [branchId]: updateWorkingDayTime(normalizeWorkingHours(prev[branchId]), day, field, value),
    }));
  };

  const handleSaveClick = () => {
    const allSlots = branches.flatMap((branch) =>
      workingHoursToSlots(normalizeWorkingHours(hoursByBranch[branch.id]), branch.id),
    );
    onSave(allSlots);
  };

  return (
    <div className={styles.grid}>
      {conflictKeys.size > 0 ? <p className={styles.conflictHint}>{t.doctorSchedule.conflictHint}</p> : null}

      <div className={styles.branchesRow}>
        {branches.map((branch) => (
          <div key={branch.id} className={styles.branchGroup}>
            <span className={styles.branchName}>{branch.name}</span>
            <div className={styles.compactRows}>
              {WEEKDAY_KEYS.map((day) => {
                const schedule = hoursByBranch[branch.id]?.[day] ?? null;
                const isOpen = schedule !== null;
                const isConflict = conflictKeys.has(`${branch.id}:${day}`);

                return (
                  <div
                    key={day}
                    className={`${styles.compactRow} ${isConflict ? styles.compactRowConflict : ''}`}
                  >
                    <Checkbox
                      className={styles.compactCheckbox}
                      label={t.weekdaysShort[day]}
                      checked={isOpen}
                      disabled={readOnly}
                      onChange={(checked) => handleToggleDay(branch.id, day, checked)}
                    />
                    <TimeSelect
                      value={schedule?.from ?? '09:00'}
                      disabled={readOnly || !isOpen}
                      conflict={isConflict}
                      onChange={(value) => handleTimeChange(branch.id, day, 'from', value)}
                    />
                    <span className={styles.separator}>–</span>
                    <TimeSelect
                      value={schedule?.to ?? '18:00'}
                      disabled={readOnly || !isOpen}
                      conflict={isConflict}
                      onChange={(value) => handleTimeChange(branch.id, day, 'to', value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!readOnly ? (
        <div className={styles.footer}>
          <Button type="button" disabled={isSaving} onClick={handleSaveClick}>
            {isSaving ? t.doctorSchedule.saving : t.doctorSchedule.save}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export const DoctorScheduleSection = ({
  doctorProfileId,
  branchId,
  readOnly = false,
  className,
  style,
}: DoctorScheduleSectionProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { branches: allBranches } = useBranchOptions();
  const { slots, isLoading, saveMutation } = useDoctorSchedule(doctorProfileId);

  const branches = branchId
    ? [...allBranches].sort((a, b) => {
        if (a.id === branchId) return -1;
        if (b.id === branchId) return 1;
        return 0;
      })
    : allBranches;

  const handleSave = (nextSlots: ScheduleSlotInput[]) => {
    saveMutation.mutate(nextSlots, {
      onSuccess: () => showToast(t.doctorSchedule.saved, 'success'),
      onError: (error) => showToast(error.message || t.doctorSchedule.saveError, 'danger'),
    });
  };

  if (branches.length === 0) {
    return (
      <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
        <p className={styles.hint}>{t.doctorSchedule.noBranches}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {isLoading ? (
        <p className={styles.hint}>{t.common.loading}</p>
      ) : (
        <BranchesGrid
          key={doctorProfileId}
          branches={branches}
          initialSlots={slots}
          readOnly={readOnly}
          isSaving={saveMutation.isPending}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
