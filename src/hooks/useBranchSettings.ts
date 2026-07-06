'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateBranchPayload } from '@/common/types/settings';
import { createBranch, deleteBranch, fetchBranches } from '@/helpers/settings.api';
import { normalizeWorkingHours } from '@/helpers/working-hours';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const dayScheduleSchema = z
  .object({
    from: z.string(),
    to: z.string(),
  })
  .nullable();

const workingHoursSchema = z.object({
  mon: dayScheduleSchema,
  tue: dayScheduleSchema,
  wed: dayScheduleSchema,
  thu: dayScheduleSchema,
  fri: dayScheduleSchema,
  sat: dayScheduleSchema,
  sun: dayScheduleSchema,
});

const createBranchSchema = z.object({
  name: z.string().min(1, 'Укажите название'),
  address: z.string().min(1, 'Укажите адрес'),
  phone: z.string(),
  latitude: z.string(),
  longitude: z.string(),
  isActive: z.boolean(),
  useCustomHours: z.boolean(),
  workingHours: workingHoursSchema,
});

export type CreateBranchFormValues = z.infer<typeof createBranchSchema>;

export const BRANCHES_QUERY_KEY = ['settings', 'branches'] as const;

const getDefaultBranchFormValues = (): CreateBranchFormValues => ({
  name: '',
  address: '',
  phone: '',
  latitude: '',
  longitude: '',
  isActive: true,
  useCustomHours: false,
  workingHours: normalizeWorkingHours(null),
});

const mapFormValuesToPayload = (values: CreateBranchFormValues): CreateBranchPayload => ({
  name: values.name.trim(),
  address: values.address.trim(),
  phone: values.phone.trim() || undefined,
  latitude: values.latitude.trim() || undefined,
  longitude: values.longitude.trim() || undefined,
  isActive: values.isActive,
  workingHours: values.useCustomHours ? values.workingHours : undefined,
});

export const useBranchSettings = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const branchesQuery = useQuery({
    queryKey: BRANCHES_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchBranches(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const createForm = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: getDefaultBranchFormValues(),
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateBranchFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return createBranch(accessToken, mapFormValuesToPayload(values));
    },
    onSuccess: async () => {
      createForm.reset(getDefaultBranchFormValues());
      await queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (branchId: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return deleteBranch(accessToken, branchId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
  });

  const onCreateSubmit = createForm.handleSubmit((values) => {
    createMutation.mutate(values);
  });

  const resetCreateForm = () => {
    createForm.reset(getDefaultBranchFormValues());
    createMutation.reset();
  };

  return {
    branchesQuery,
    createForm,
    createMutation,
    deleteMutation,
    onCreateSubmit,
    resetCreateForm,
  };
};
