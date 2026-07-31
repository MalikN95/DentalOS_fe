'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ApiRequestError } from '@/helpers/api-fetch';
import {
  createAppointment,
  fetchAppointmentFormOptions,
  fetchDoctorAppointmentsForDate,
} from '@/helpers/appointments.api';
import { parseDateInputValue, toDateInputValue } from '@/helpers/date';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const HTTP_CONFLICT = 409;
// Backend error codes that get a field-level message instead of the generic banner.
export const FIELD_ERROR_CODES = {
  OUTSIDE_WORKING_HOURS: 'outsideWorkingHours',
  DOCTOR_DAY_OFF: 'doctorDayOff',
} as const;

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
  date: z.string().min(1, 'Укажите дату'),
  time: z.string().min(1, 'Укажите время'),
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
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);

  return {
    branchId: '',
    patientId: initialPatientId ?? '',
    doctorProfileId: '',
    serviceId: '',
    date: toDateInputValue(now),
    time: `${String(now.getHours()).padStart(2, '0')}:00`,
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
  const { t: dict } = useTranslation();

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
  const selectedDoctorProfileId = useWatch({
    control: form.control,
    name: 'doctorProfileId',
  });
  const selectedDateValue = useWatch({
    control: form.control,
    name: 'date',
  });

  const busyHoursQuery = useQuery({
    queryKey: ['appointments', 'doctor-busy-hours', selectedDoctorProfileId, selectedDateValue],
    queryFn: ({ signal }) => {
      if (!accessToken || !selectedDoctorProfileId || !selectedDateValue) {
        throw new Error('Not ready');
      }

      return fetchDoctorAppointmentsForDate(
        accessToken,
        selectedDoctorProfileId,
        parseDateInputValue(selectedDateValue),
        signal,
      );
    },
    enabled: Boolean(accessToken && selectedDoctorProfileId && selectedDateValue),
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
        startsAt: new Date(`${values.date}T${values.time}`).toISOString(),
        durationMinutes: values.durationMinutes,
        comment: values.comment?.trim() || undefined,
      });
    },
    onSuccess: () => {
      form.reset(getDefaultFormValues(initialPatientId));
      onSuccess?.();
    },
    onError: (error) => {
      // Surfaces a doctor/time-slot conflict, or a working-hours violation,
      // on the field it's actually about instead of a generic error banner.
      if (!(error instanceof ApiRequestError)) {
        return;
      }

      if (error.status === HTTP_CONFLICT) {
        form.setError('time', { message: dict.appointments.slotTaken });
        return;
      }

      const messageKey =
        error.code && error.code in FIELD_ERROR_CODES
          ? FIELD_ERROR_CODES[error.code as keyof typeof FIELD_ERROR_CODES]
          : null;

      if (messageKey) {
        form.setError('time', { message: dict.appointments[messageKey] });
      }
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
    busyHoursQuery,
  };
};
