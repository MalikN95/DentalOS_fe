'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ReplaceTreatmentPlanItemsPayload,
  TreatmentPlanItemStatus,
  UpdateTreatmentPlanPayload,
} from '@/common/types/treatment-plan';
import {
  fetchTreatmentPlan,
  replaceTreatmentPlanItems,
  updateTreatmentPlan,
  updateTreatmentPlanItemStatus,
} from '@/helpers/treatment-plans.api';
import { TREATMENT_PLANS_QUERY_KEY } from '@/hooks/useTreatmentPlans';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const useTreatmentPlan = (planId: string | null) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TREATMENT_PLANS_QUERY_KEY, planId, 'detail'],
    queryFn: ({ signal }) => {
      if (!accessToken || !planId) throw new Error('Not authenticated');
      return fetchTreatmentPlan(accessToken, planId, signal);
    },
    enabled: Boolean(accessToken) && Boolean(planId),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [TREATMENT_PLANS_QUERY_KEY] }).catch(() => undefined);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTreatmentPlanPayload) => {
      if (!accessToken || !planId) throw new Error('Not authenticated');
      return updateTreatmentPlan(accessToken, planId, payload);
    },
    onSuccess: invalidate,
  });

  const replaceItemsMutation = useMutation({
    mutationFn: (payload: ReplaceTreatmentPlanItemsPayload) => {
      if (!accessToken || !planId) throw new Error('Not authenticated');
      return replaceTreatmentPlanItems(accessToken, planId, payload);
    },
    onSuccess: invalidate,
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: TreatmentPlanItemStatus }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateTreatmentPlanItemStatus(accessToken, itemId, status);
    },
    onSuccess: invalidate,
  });

  return {
    plan: query.data ?? null,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    updateMutation,
    replaceItemsMutation,
    updateItemStatusMutation,
  };
};
