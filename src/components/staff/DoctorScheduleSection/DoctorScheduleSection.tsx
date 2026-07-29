'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiDoctorScheduleSlot } from '@/common/types/schedule';
import type { WorkingHours } from '@/common/types/settings';
import { WorkingHoursEditor } from '@/components/settings/WorkingHoursEditor/WorkingHoursEditor';
import { useToast } from '@/components/providers/ToastProvider';
import { Button } from '@/components/ui';
import { slotsToWorkingHours, workingHoursToSlots } from '@/helpers/doctor-schedule';
import { useDoctorSchedule } from '@/hooks/useDoctorSchedule';
import styles from './DoctorScheduleSection.module.css';

type DoctorScheduleSectionProps = {
  doctorProfileId: string;
  branchId: string | null;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type ScheduleEditorProps = {
  branchId: string;
  initialSlots: ApiDoctorScheduleSlot[];
  readOnly: boolean;
  isSaving: boolean;
  onSave: (slots: ReturnType<typeof workingHoursToSlots>) => void;
};

/** Keyed by branchId from the parent, so switching branches remounts with fresh data
 *  instead of needing an effect to re-derive local state from props. */
const ScheduleEditor = ({
  branchId,
  initialSlots,
  readOnly,
  isSaving,
  onSave,
}: ScheduleEditorProps) => {
  const { t } = useTranslation();
  const [hours, setHours] = useState<WorkingHours>(() =>
    slotsToWorkingHours(initialSlots, branchId),
  );

  return (
    <>
      <WorkingHoursEditor value={hours} onChange={setHours} disabled={readOnly} />

      {!readOnly ? (
        <div className={styles.footer}>
          <Button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(workingHoursToSlots(hours, branchId))}
          >
            {isSaving ? t.doctorSchedule.saving : t.doctorSchedule.save}
          </Button>
        </div>
      ) : null}
    </>
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
  const { slots, isLoading, saveMutation } = useDoctorSchedule(doctorProfileId);

  const handleSave = (nextSlots: ReturnType<typeof workingHoursToSlots>) => {
    saveMutation.mutate(nextSlots, {
      onSuccess: () => showToast(t.doctorSchedule.saved, 'success'),
      onError: (error) => showToast(error.message || t.doctorSchedule.saveError, 'danger'),
    });
  };

  if (!branchId) {
    return (
      <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
        <p className={styles.hint}>{t.doctorSchedule.branchRequired}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {isLoading ? (
        <p className={styles.hint}>{t.common.loading}</p>
      ) : (
        <ScheduleEditor
          key={branchId}
          branchId={branchId}
          initialSlots={slots}
          readOnly={readOnly}
          isSaving={saveMutation.isPending}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
