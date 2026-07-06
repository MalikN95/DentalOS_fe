'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ClinicSettings, UpdateClinicPayload } from '@/common/types/settings';
import {
  fetchClinicSettings,
  requestClinicLogoUpload,
  updateClinicSettings,
  uploadFileToPresignedUrl,
} from '@/helpers/settings.api';
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

const clinicSettingsSchema = z.object({
  address: z.string(),
  phone: z.string(),
  email: z.union([z.literal(''), z.email('Введите корректный email')]),
  timezone: z.string().min(1, 'Укажите часовой пояс'),
  currency: z.string().length(3, '3 символа, например RUB'),
  language: z.string().min(2, 'Минимум 2 символа').max(5),
  isActive: z.boolean(),
  workingHours: workingHoursSchema,
});

export type ClinicSettingsFormValues = z.infer<typeof clinicSettingsSchema>;

export const CLINIC_SETTINGS_QUERY_KEY = ['settings', 'clinic'] as const;

const mapClinicToFormValues = (clinic: ClinicSettings): ClinicSettingsFormValues => ({
  address: clinic.address ?? '',
  phone: clinic.phone ?? '',
  email: clinic.email ?? '',
  timezone: clinic.timezone,
  currency: clinic.currency,
  language: clinic.language,
  isActive: clinic.isActive,
  workingHours: normalizeWorkingHours(clinic.workingHours),
});

const mapFormValuesToPayload = (values: ClinicSettingsFormValues): UpdateClinicPayload => ({
  address: values.address.trim() || undefined,
  phone: values.phone.trim() || undefined,
  email: values.email.trim() || undefined,
  timezone: values.timezone.trim(),
  currency: values.currency.trim().toUpperCase(),
  language: values.language.trim(),
  isActive: values.isActive,
  workingHours: values.workingHours,
});

export const useClinicSettings = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const clinicQuery = useQuery({
    queryKey: CLINIC_SETTINGS_QUERY_KEY,
    queryFn: () => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchClinicSettings(accessToken);
    },
    enabled: Boolean(accessToken),
  });

  const form = useForm<ClinicSettingsFormValues>({
    resolver: zodResolver(clinicSettingsSchema),
    defaultValues: {
      address: '',
      phone: '',
      email: '',
      timezone: 'Europe/Moscow',
      currency: 'RUB',
      language: 'ru',
      isActive: true,
      workingHours: normalizeWorkingHours(null),
    },
  });

  useEffect(() => {
    if (clinicQuery.data) {
      form.reset(mapClinicToFormValues(clinicQuery.data));
    }
  }, [clinicQuery.data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: ClinicSettingsFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return updateClinicSettings(accessToken, mapFormValuesToPayload(values));
    },
    onSuccess: (clinic) => {
      queryClient.setQueryData(CLINIC_SETTINGS_QUERY_KEY, clinic);
      form.reset(mapClinicToFormValues(clinic));
    },
  });

  const logoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const { uploadUrl, key } = await requestClinicLogoUpload(accessToken, file.type);
      await uploadFileToPresignedUrl(uploadUrl, file);
      return updateClinicSettings(accessToken, { logoKey: key });
    },
    onSuccess: (clinic) => {
      queryClient.setQueryData(CLINIC_SETTINGS_QUERY_KEY, clinic);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(values);
  });

  return {
    clinicQuery,
    form,
    updateMutation,
    logoMutation,
    onSubmit,
  };
};
