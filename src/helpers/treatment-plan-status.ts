import type { TreatmentPlanItemStatus, TreatmentPlanStatus } from '@/common/types/treatment-plan';
import type { BadgeColor } from '@/components/ui';

// Labels live in the locale dictionary (t.treatmentPlans.status); only colors here.
export const treatmentPlanStatusColor: Record<TreatmentPlanStatus, BadgeColor> = {
  draft: 'gray',
  proposed: 'primary',
  approved: 'primary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'danger',
};

export const treatmentPlanItemStatusColor: Record<TreatmentPlanItemStatus, BadgeColor> = {
  planned: 'gray',
  done: 'success',
  skipped: 'warning',
};
