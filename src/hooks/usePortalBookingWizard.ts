'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMyBooking,
  fetchMyBookingBranches,
  fetchMyBookingDays,
  fetchMyBookingDoctors,
  fetchMyBookingServices,
  fetchMyBookingSlots,
} from '@/helpers/patient-portal.api';
import { PORTAL_APPOINTMENTS_QUERY_KEY } from '@/hooks/usePortalAppointments';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export type PortalBookingStep = 'service' | 'doctor' | 'datetime' | 'confirm' | 'done';

const toMonthValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const usePortalBookingWizard = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<PortalBookingStep>('service');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const branchesQuery = useQuery({
    queryKey: ['portal-booking', 'branches'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchMyBookingBranches(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const servicesQuery = useQuery({
    queryKey: ['portal-booking', 'services'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchMyBookingServices(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const doctorsQuery = useQuery({
    queryKey: ['portal-booking', 'doctors', serviceId],
    queryFn: ({ signal }) => {
      if (!accessToken || !serviceId) throw new Error('Not ready');
      return fetchMyBookingDoctors(accessToken, { serviceId }, signal);
    },
    enabled: Boolean(accessToken && serviceId),
  });

  const allServices = useMemo(
    () => (servicesQuery.data ?? []).flatMap((category) => category.services),
    [servicesQuery.data],
  );

  const selectedService = allServices.find((service) => service.id === serviceId) ?? null;
  const selectedDoctor = doctorsQuery.data?.find((doctor) => doctor.id === doctorProfileId) ?? null;
  // Derived from the doctor, not chosen by the patient — same as the public widget.
  const resolvedBranchId = selectedDoctor?.branchId ?? null;
  const selectedBranch = branchesQuery.data?.find((branch) => branch.id === resolvedBranchId) ?? null;

  const monthValue = toMonthValue(visibleMonth);

  const daysQuery = useQuery({
    queryKey: ['portal-booking', 'days', doctorProfileId, serviceId, resolvedBranchId, monthValue],
    queryFn: ({ signal }) => {
      if (!accessToken || !doctorProfileId || !serviceId || !resolvedBranchId) {
        throw new Error('Not ready');
      }
      return fetchMyBookingDays(
        accessToken,
        { doctorProfileId, serviceId, branchId: resolvedBranchId, month: monthValue },
        signal,
      );
    },
    enabled: step === 'datetime' && Boolean(doctorProfileId && serviceId && resolvedBranchId),
  });

  const slotsQuery = useQuery({
    queryKey: ['portal-booking', 'slots', doctorProfileId, serviceId, resolvedBranchId, date],
    queryFn: ({ signal }) => {
      if (!accessToken || !doctorProfileId || !serviceId || !resolvedBranchId || !date) {
        throw new Error('Not ready');
      }
      return fetchMyBookingSlots(
        accessToken,
        { doctorProfileId, serviceId, branchId: resolvedBranchId, date },
        signal,
      );
    },
    enabled: step === 'datetime' && Boolean(doctorProfileId && serviceId && resolvedBranchId && date),
  });

  const bookingMutation = useMutation({
    mutationFn: () => {
      if (!accessToken || !resolvedBranchId || !serviceId || !doctorProfileId || !date || !time) {
        throw new Error('Not ready');
      }
      return createMyBooking(accessToken, {
        branchId: resolvedBranchId,
        serviceId,
        doctorProfileId,
        date,
        time,
        comment: comment.trim() || undefined,
      });
    },
    onSuccess: () => {
      setStep('done');
      queryClient.invalidateQueries({ queryKey: [PORTAL_APPOINTMENTS_QUERY_KEY] }).catch(() => undefined);
    },
  });

  const selectService = (id: string) => {
    setServiceId(id);
    setDoctorProfileId(null);
    setDate(null);
    setTime(null);
    setStep('doctor');
  };

  const selectDoctor = (id: string) => {
    setDoctorProfileId(id);
    setDate(null);
    setTime(null);
    setVisibleMonth(new Date());
    setStep('datetime');
  };

  const selectDate = (value: string) => {
    setDate(value);
    setTime(null);
  };

  const selectTime = (value: string) => {
    setTime(value);
    setStep('confirm');
  };

  const goToPrevMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const canGoToPrevMonth = !isSameMonth(visibleMonth, new Date());

  const goBack = () => {
    if (step === 'doctor') {
      setStep('service');
      return;
    }
    if (step === 'datetime') {
      setStep('doctor');
      return;
    }
    if (step === 'confirm') {
      setStep('datetime');
    }
  };

  const canGoBack = step === 'doctor' || step === 'datetime' || step === 'confirm';

  const reset = () => {
    setStep('service');
    setServiceId(null);
    setDoctorProfileId(null);
    setDate(null);
    setTime(null);
    setComment('');
    bookingMutation.reset();
  };

  return {
    step,
    branchesQuery,
    servicesQuery,
    allServices,
    doctorsQuery,
    daysQuery,
    slotsQuery,
    selectedBranch,
    selectedService,
    selectedDoctor,
    date,
    time,
    visibleMonth,
    canGoToPrevMonth,
    comment,
    setComment,
    bookingMutation,
    selectService,
    selectDoctor,
    selectDate,
    selectTime,
    goToPrevMonth,
    goToNextMonth,
    goBack,
    canGoBack,
    reset,
    submitBooking: () => bookingMutation.mutate(),
  };
};
