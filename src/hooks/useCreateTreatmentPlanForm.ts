'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { TreatmentPlanItemPayload } from '@/common/types/treatment-plan';
import { createTreatmentPlan, fetchTreatmentPlanFormOptions } from '@/helpers/treatment-plans.api';
import { TREATMENT_PLANS_QUERY_KEY } from '@/hooks/useTreatmentPlans';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const createTreatmentPlanSchema = z.object({
  patientId: z.uuid('Выберите пациента'),
  title: z.string().trim().min(1, 'Укажите название плана'),
  doctorProfileId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateTreatmentPlanFormValues = z.infer<typeof createTreatmentPlanSchema>;

const getEmptyValues = (patientId: string): CreateTreatmentPlanFormValues => ({
  patientId,
  title: '',
  doctorProfileId: '',
  notes: '',
});

type UseCreateTreatmentPlanFormParams = {
  initialPatientId?: string;
  onSuccess?: () => void;
};

export const useCreateTreatmentPlanForm = ({
  initialPatientId,
  onSuccess,
}: UseCreateTreatmentPlanFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const optionsQuery = useQuery({
    queryKey: [TREATMENT_PLANS_QUERY_KEY, 'form-options'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchTreatmentPlanFormOptions(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const form = useForm<CreateTreatmentPlanFormValues>({
    resolver: zodResolver(createTreatmentPlanSchema),
    defaultValues: getEmptyValues(initialPatientId ?? ''),
  });

  const mutation = useMutation({
    mutationFn: ({
      values,
      items,
    }: {
      values: CreateTreatmentPlanFormValues;
      items: TreatmentPlanItemPayload[];
    }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return createTreatmentPlan(accessToken, {
        patientId: values.patientId,
        title: values.title.trim(),
        notes: values.notes?.trim() || undefined,
        doctorProfileId: values.doctorProfileId || undefined,
        items,
      });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [TREATMENT_PLANS_QUERY_KEY] })
        .catch(() => undefined);
      form.reset(getEmptyValues(initialPatientId ?? ''));
      onSuccess?.();
    },
  });

  return { form, optionsQuery, mutation };
};
