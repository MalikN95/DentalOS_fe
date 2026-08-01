'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ApiService, CreateServicePayload } from '@/common/types/service';
import { createService, updateService } from '@/helpers/services.api';
import { SERVICES_QUERY_KEY } from '@/hooks/useServices';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const MAX_DURATION_MINUTES = 24 * 60;

const serviceSchema = z.object({
  categoryId: z.string(),
  name: z.string().trim().min(1, 'Укажите название').max(255),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Например: 1500 или 1500.00'),
  durationMinutes: z
    .string()
    .refine(
      (value) =>
        Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= MAX_DURATION_MINUTES,
      `Введите целое число от 1 до ${MAX_DURATION_MINUTES}`,
    ),
  description: z.string(),
  preparation: z.string(),
  isActive: z.boolean(),
  acceptsOnlineBooking: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;

const EMPTY_VALUES: ServiceFormValues = {
  categoryId: '',
  name: '',
  price: '',
  durationMinutes: '',
  description: '',
  preparation: '',
  isActive: true,
  acceptsOnlineBooking: false,
};

const serviceToValues = (service: ApiService): ServiceFormValues => ({
  categoryId: service.categoryId ?? '',
  name: service.name,
  price: service.price,
  durationMinutes: String(service.durationMinutes),
  description: service.description ?? '',
  preparation: service.preparation ?? '',
  isActive: service.isActive,
  acceptsOnlineBooking: service.acceptsOnlineBooking,
});

const valuesToPayload = (values: ServiceFormValues): CreateServicePayload => ({
  categoryId: values.categoryId || null,
  name: values.name.trim(),
  price: values.price.trim(),
  durationMinutes: Number(values.durationMinutes),
  description: values.description.trim() || null,
  preparation: values.preparation.trim() || null,
  isActive: values.isActive,
  acceptsOnlineBooking: values.acceptsOnlineBooking,
});

type UseServiceFormParams = {
  service?: ApiService | null;
  onSuccess?: () => void;
};

export const useServiceForm = ({ service, onSuccess }: UseServiceFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();
  const isEditMode = Boolean(service);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service ? serviceToValues(service) : EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(service ? serviceToValues(service) : EMPTY_VALUES);
  }, [service, reset]);

  const mutation = useMutation({
    mutationFn: (values: ServiceFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const payload = valuesToPayload(values);

      if (!service) {
        return createService(accessToken, payload);
      }

      return updateService(accessToken, service.id, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [SERVICES_QUERY_KEY] });
      onSuccess?.();
    },
  });

  return { form, mutation, isEditMode };
};
