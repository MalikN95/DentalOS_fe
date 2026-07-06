'use client';

import { useCallback, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { createAppointment, fetchAppointmentFormOptions } from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const createAppointmentSchema = z.object({
  branchId: z.uuid('Выберите филиал'),
  patientId: z.uuid('Выберите пациента'),
  doctorProfileId: z.uuid('Выберите врача'),
  serviceId: z.uuid('Выберите услугу'),
  startsAt: z.string().min(1, 'Укажите дату и время'),
  comment: z.string().optional(),
});

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

const getDefaultFormValues = (): CreateAppointmentFormValues => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return {
    branchId: '',
    patientId: '',
    doctorProfileId: '',
    serviceId: '',
    startsAt: local.toISOString().slice(0, 16),
    comment: '',
  };
};

type UseCreateAppointmentFormParams = {
  onSuccess?: () => void;
};

export const useCreateAppointmentForm = ({ onSuccess }: UseCreateAppointmentFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  const optionsQuery = useQuery({
    queryKey: ['appointments', 'form-options'],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchAppointmentFormOptions(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: getDefaultFormValues(),
  });

  const selectedBranchId = useWatch({
    control: form.control,
    name: 'branchId',
  });

  const filteredDoctors = useMemo(() => {
    const doctors = optionsQuery.data?.doctors ?? [];

    return doctors.filter((doctor) => {
      const branchMatches = !selectedBranchId || doctor.branchId === selectedBranchId;

      return branchMatches;
    });
  }, [optionsQuery.data?.doctors, selectedBranchId]);

  const mutation = useMutation({
    mutationFn: (values: CreateAppointmentFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return createAppointment(accessToken, {
        branchId: values.branchId,
        patientId: values.patientId,
        doctorProfileId: values.doctorProfileId,
        serviceId: values.serviceId,
        startsAt: new Date(values.startsAt).toISOString(),
        comment: values.comment?.trim() || undefined,
      });
    },
    onSuccess: () => {
      form.reset(getDefaultFormValues());
      onSuccess?.();
    },
  });

  const resetDoctorSelection = useCallback(() => {
    form.setValue('doctorProfileId', '');
  }, [form]);

  return {
    form,
    optionsQuery,
    filteredDoctors,
    mutation,
    resetDoctorSelection,
  };
};
