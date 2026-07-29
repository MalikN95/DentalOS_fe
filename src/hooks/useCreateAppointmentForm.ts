'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { createAppointment, fetchAppointmentFormOptions } from '@/helpers/appointments.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

// Kept in sync with the backend's own floor/ceiling (create-appointment.dto.ts).
export const MIN_APPOINTMENT_DURATION = 15;
export const MAX_APPOINTMENT_DURATION = 480;
export const APPOINTMENT_DURATION_STEP = 15;
export const APPOINTMENT_DURATION_PRESETS = [15, 30, 45, 60, 90, 120];

const createAppointmentSchema = z.object({
  branchId: z.uuid('Выберите филиал'),
  patientId: z.uuid('Выберите пациента'),
  doctorProfileId: z.uuid('Выберите врача'),
  serviceId: z.uuid('Выберите услугу'),
  startsAt: z.string().min(1, 'Укажите дату и время'),
  durationMinutes: z
    .number('Укажите продолжительность')
    .int()
    .min(MIN_APPOINTMENT_DURATION, `Минимум ${MIN_APPOINTMENT_DURATION} минут`)
    .max(MAX_APPOINTMENT_DURATION, `Максимум ${MAX_APPOINTMENT_DURATION} минут`)
    .refine((value) => value % APPOINTMENT_DURATION_STEP === 0, 'Шаг — 15 минут'),
  comment: z.string().optional(),
});

export type CreateAppointmentFormValues = z.infer<typeof createAppointmentSchema>;

const DEFAULT_DURATION = 30;

// Nearest 15-minute step, floored at the minimum — for turning a service's
// own (possibly non-multiple-of-15) duration into a valid form value.
const roundToDurationStep = (minutes: number): number =>
  Math.max(
    Math.round(minutes / APPOINTMENT_DURATION_STEP) * APPOINTMENT_DURATION_STEP,
    MIN_APPOINTMENT_DURATION,
  );

const getDefaultFormValues = (initialPatientId?: string): CreateAppointmentFormValues => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 1);

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);

  return {
    branchId: '',
    patientId: initialPatientId ?? '',
    doctorProfileId: '',
    serviceId: '',
    startsAt: local.toISOString().slice(0, 16),
    durationMinutes: DEFAULT_DURATION,
    comment: '',
  };
};

type UseCreateAppointmentFormParams = {
  /** Pre-selects (and locks) the patient, e.g. when opened from their profile. */
  initialPatientId?: string;
  onSuccess?: () => void;
};

export const useCreateAppointmentForm = ({
  initialPatientId,
  onSuccess,
}: UseCreateAppointmentFormParams) => {
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
    defaultValues: getDefaultFormValues(initialPatientId),
  });

  const selectedBranchId = useWatch({
    control: form.control,
    name: 'branchId',
  });
  const selectedServiceId = useWatch({
    control: form.control,
    name: 'serviceId',
  });

  const filteredDoctors = useMemo(() => {
    const doctors = optionsQuery.data?.doctors ?? [];

    return doctors.filter((doctor) => {
      const branchMatches = !selectedBranchId || doctor.branchId === selectedBranchId;

      return branchMatches;
    });
  }, [optionsQuery.data?.doctors, selectedBranchId]);

  // Suggests the service's own duration as soon as it's picked — but only
  // until the user overrides it themselves (a preset click or manual edit),
  // so re-picking a service later doesn't clobber their choice.
  useEffect(() => {
    if (!selectedServiceId || form.formState.dirtyFields.durationMinutes) return;

    const service = optionsQuery.data?.services.find((item) => item.id === selectedServiceId);
    if (!service) return;

    form.setValue('durationMinutes', roundToDurationStep(service.durationMinutes), {
      shouldDirty: false,
    });
    // form/dirtyFields are stable react-hook-form handles; re-running per
    // selectedServiceId/services is what actually matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServiceId, optionsQuery.data?.services]);

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
        durationMinutes: values.durationMinutes,
        comment: values.comment?.trim() || undefined,
      });
    },
    onSuccess: () => {
      form.reset(getDefaultFormValues(initialPatientId));
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
