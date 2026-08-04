'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type {
  CreateClinicPayload,
  PlatformClinicSummary,
  UpdateClinicPayload,
} from '@/common/types/platform-admin';
import { createPlatformClinic, updatePlatformClinic } from '@/helpers/platform-admin.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const clinicFieldsShape = {
  name: z.string().trim().min(1, 'Укажите название').max(200),
  slug: z
    .string()
    .trim()
    .min(1, 'Укажите slug')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Только строчные латинские буквы, цифры и дефис'),
  address: z.string(),
  phone: z.string(),
  email: z.union([z.literal(''), z.email('Некорректный email')]),
  timezone: z.string(),
  currency: z.string(),
  language: z.string(),
  adminFirstName: z.string(),
  adminLastName: z.string(),
  adminEmail: z.union([z.literal(''), z.email('Некорректный email')]),
  adminPhone: z.string(),
  adminPassword: z.string(),
};

// The admin-user fields are only required when creating a brand-new clinic —
// editing an existing one never touches its admin account from this form.
const buildClinicFormSchema = (isEditMode: boolean) =>
  z.object(clinicFieldsShape).superRefine((values, ctx) => {
    if (isEditMode) return;

    if (!values.adminFirstName.trim()) {
      ctx.addIssue({ code: 'custom', path: ['adminFirstName'], message: 'Укажите имя' });
    }
    if (!values.adminLastName.trim()) {
      ctx.addIssue({ code: 'custom', path: ['adminLastName'], message: 'Укажите фамилию' });
    }
    if (!values.adminEmail.trim()) {
      ctx.addIssue({ code: 'custom', path: ['adminEmail'], message: 'Укажите email' });
    }
    if (values.adminPassword.length < 8) {
      ctx.addIssue({ code: 'custom', path: ['adminPassword'], message: 'Минимум 8 символов' });
    }
  });

export type ClinicFormValues = z.infer<ReturnType<typeof buildClinicFormSchema>>;

const EMPTY_VALUES: ClinicFormValues = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  email: '',
  timezone: 'UTC',
  currency: 'USD',
  language: 'en',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
};

const clinicToValues = (clinic: PlatformClinicSummary): ClinicFormValues => ({
  name: clinic.name,
  slug: clinic.slug,
  address: clinic.address ?? '',
  phone: clinic.phone ?? '',
  email: clinic.email ?? '',
  timezone: clinic.timezone,
  currency: clinic.currency,
  language: clinic.language,
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPhone: '',
  adminPassword: '',
});

const valuesToCreatePayload = (values: ClinicFormValues): CreateClinicPayload => ({
  name: values.name.trim(),
  slug: values.slug.trim().toLowerCase(),
  address: values.address.trim() || undefined,
  phone: values.phone.trim() || undefined,
  email: values.email.trim() || undefined,
  timezone: values.timezone.trim() || undefined,
  currency: values.currency.trim() || undefined,
  language: values.language.trim() || undefined,
  admin: {
    firstName: values.adminFirstName.trim(),
    lastName: values.adminLastName.trim(),
    email: values.adminEmail.trim(),
    phone: values.adminPhone.trim() || undefined,
    password: values.adminPassword,
  },
});

const valuesToUpdatePayload = (values: ClinicFormValues): UpdateClinicPayload => ({
  name: values.name.trim(),
  slug: values.slug.trim().toLowerCase(),
  address: values.address.trim() || undefined,
  phone: values.phone.trim() || undefined,
  email: values.email.trim() || undefined,
  timezone: values.timezone.trim() || undefined,
  currency: values.currency.trim() || undefined,
  language: values.language.trim() || undefined,
});

type UsePlatformClinicFormParams = {
  clinic?: PlatformClinicSummary | null;
  onSuccess?: () => void;
};

export const usePlatformClinicForm = ({ clinic, onSuccess }: UsePlatformClinicFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const isEditMode = Boolean(clinic);
  const schema = useMemo(() => buildClinicFormSchema(isEditMode), [isEditMode]);

  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(schema),
    defaultValues: clinic ? clinicToValues(clinic) : EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(clinic ? clinicToValues(clinic) : EMPTY_VALUES);
  }, [clinic, reset]);

  const mutation = useMutation({
    mutationFn: (values: ClinicFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      if (clinic) {
        return updatePlatformClinic(accessToken, clinic.id, valuesToUpdatePayload(values));
      }

      return createPlatformClinic(accessToken, valuesToCreatePayload(values));
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { form, mutation, isEditMode };
};
