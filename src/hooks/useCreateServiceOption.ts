'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiServiceOption } from '@/common/types/service';
import {
  createServiceOption,
  type CreateServiceOptionPayload,
} from '@/helpers/treatment-plans.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const SERVICE_OPTIONS_QUERY_KEY = ['services', 'options'];

export const useCreateServiceOption = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceOptionPayload) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createServiceOption(accessToken, payload);
    },
    onSuccess: (service) => {
      queryClient.setQueryData<ApiServiceOption[]>(SERVICE_OPTIONS_QUERY_KEY, (current) =>
        current ? [...current, service].sort((a, b) => a.name.localeCompare(b.name)) : [service],
      );
    },
  });
};
