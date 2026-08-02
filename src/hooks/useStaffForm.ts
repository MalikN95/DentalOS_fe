'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreateStaffPayload, StaffMember, UpdateStaffPayload } from '@/common/types/staff';
import { STAFF_ROLES } from '@/common/types/staff';
import { createStaff, updateStaff } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const MIN_PASSWORD_LENGTH = 8;
const MAX_EXPERIENCE_YEARS = 80;

const buildSchema = (isEditMode: boolean) =>
  z.object({
    firstName: z.string().trim().min(1, 'Укажите имя').max(120),
    lastName: z.string().trim().min(1, 'Укажите фамилию').max(120),
    email: z.email('Некорректный email'),
    phone: z.string().trim().max(32),
    role: z.enum(STAFF_ROLES),
    password: isEditMode
      ? z.union([z.literal(''), z.string().min(MIN_PASSWORD_LENGTH, 'Минимум 8 символов')])
      : z.string().min(MIN_PASSWORD_LENGTH, 'Минимум 8 символов'),
    isActive: z.boolean(),
    branchId: z.string(),
    specializations: z.array(z.string()),
    education: z.string(),
    acceptsOnlineBooking: z.boolean(),
    serviceIds: z.array(z.string()),
    experienceYears: z
      .string()
      .refine(
        (value) =>
          value === '' ||
          (Number.isInteger(Number(value)) &&
            Number(value) >= 0 &&
            Number(value) <= MAX_EXPERIENCE_YEARS),
        'Введите число от 0 до 80',
      ),
    description: z.string(),
    notifyEmail: z.boolean(),
    notifyWhatsapp: z.boolean(),
    notifyPush: z.boolean(),
    notifyInApp: z.boolean(),
    reviewAlertMaxRating: z.number().int().min(1).max(5),
  });

export type StaffFormValues = z.infer<ReturnType<typeof buildSchema>>;

const EMPTY_VALUES: StaffFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'receptionist',
  password: '',
  isActive: true,
  branchId: '',
  specializations: [],
  education: '',
  experienceYears: '',
  description: '',
  acceptsOnlineBooking: false,
  serviceIds: [],
  notifyEmail: true,
  notifyWhatsapp: true,
  notifyPush: true,
  notifyInApp: true,
  reviewAlertMaxRating: 3,
};

const splitList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value: string[] | null | undefined): string => (value ?? []).join(', ');

const staffToValues = (member: StaffMember): StaffFormValues => ({
  firstName: member.firstName,
  lastName: member.lastName,
  email: member.email,
  phone: member.phone ?? '',
  role: member.role,
  password: '',
  isActive: member.isActive,
  branchId: member.doctorProfile?.branchId ?? '',
  specializations: member.doctorProfile?.specializations ?? [],
  education: joinList(member.doctorProfile?.education),
  experienceYears:
    member.doctorProfile?.experienceYears === undefined
      ? ''
      : String(member.doctorProfile.experienceYears),
  description: member.doctorProfile?.description ?? '',
  acceptsOnlineBooking: member.doctorProfile?.acceptsOnlineBooking ?? false,
  serviceIds: member.doctorProfile?.services.map((service) => service.id) ?? [],
  notifyEmail: member.notificationPreferences?.email ?? true,
  notifyWhatsapp: member.notificationPreferences?.whatsapp ?? true,
  notifyPush: member.notificationPreferences?.push ?? true,
  notifyInApp: member.notificationPreferences?.inApp ?? true,
  reviewAlertMaxRating: member.notificationPreferences?.reviewAlertMaxRating ?? 3,
});

const valuesToPayload = (values: StaffFormValues): CreateStaffPayload => {
  const payload: CreateStaffPayload = {
    email: values.email.trim().toLowerCase(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim() || undefined,
    role: values.role,
    password: values.password,
    isActive: values.isActive,
    notificationPreferences: {
      email: values.notifyEmail,
      whatsapp: values.notifyWhatsapp,
      push: values.notifyPush,
      inApp: values.notifyInApp,
      reviewAlertMaxRating: values.reviewAlertMaxRating,
    },
  };

  if (values.role !== 'doctor') {
    return payload;
  }

  return {
    ...payload,
    doctor: {
      branchId: values.branchId || null,
      specializations: values.specializations,
      education: splitList(values.education),
      experienceYears: values.experienceYears ? Number(values.experienceYears) : 0,
      description: values.description.trim() || null,
      acceptsOnlineBooking: values.acceptsOnlineBooking,
      serviceIds: values.serviceIds,
    },
  };
};

type UseStaffFormParams = {
  member?: StaffMember | null;
  onSuccess?: () => void;
};

export const useStaffForm = ({ member, onSuccess }: UseStaffFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const isEditMode = Boolean(member);

  const schema = useMemo(() => buildSchema(isEditMode), [isEditMode]);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: member ? staffToValues(member) : EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(member ? staffToValues(member) : EMPTY_VALUES);
  }, [member, reset]);

  const mutation = useMutation({
    mutationFn: (values: StaffFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const payload = valuesToPayload(values);

      if (!member) {
        return createStaff(accessToken, payload);
      }

      // An empty password field means "keep the current credentials".
      const { password, ...rest } = payload;
      const updatePayload: UpdateStaffPayload = password ? payload : rest;

      return updateStaff(accessToken, member.id, updatePayload);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { form, mutation, isEditMode };
};
