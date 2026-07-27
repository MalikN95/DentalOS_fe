'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ApiTreatmentPlanItem,
  TreatmentPlanItemStatus,
  TreatmentPlanStatus,
} from '@/common/types/treatment-plan';
import { fetchTreatmentPlans, updateTreatmentPlanItemStatus } from '@/helpers/treatment-plans.api';
import { TREATMENT_PLANS_QUERY_KEY } from '@/hooks/useTreatmentPlans';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

// Only plans the patient has actually agreed to (approved) or already started
// are actionable during a visit — drafts/proposals aren't ready to execute yet.
const ACTIONABLE_PLAN_STATUSES: TreatmentPlanStatus[] = ['approved', 'in_progress'];

export type TreatmentChecklistItem = ApiTreatmentPlanItem & { planTitle: string };

export const useAppointmentTreatmentChecklist = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TREATMENT_PLANS_QUERY_KEY, patientId, 'list'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchTreatmentPlans(accessToken, { page: 1, limit: 200, patientId }, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  const items = useMemo<TreatmentChecklistItem[]>(() => {
    const plans = query.data?.items ?? [];

    return plans
      .filter((plan) => ACTIONABLE_PLAN_STATUSES.includes(plan.status))
      .flatMap((plan) => plan.items.map((item) => ({ ...item, planTitle: plan.title })));
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: TreatmentPlanItemStatus }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateTreatmentPlanItemStatus(accessToken, itemId, status);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [TREATMENT_PLANS_QUERY_KEY] })
        .catch(() => undefined);
    },
  });

  return {
    items,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    mutation,
  };
};
