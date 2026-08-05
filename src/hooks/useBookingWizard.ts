'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getToken } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY } from '@/common/constants/env';
import type { CreateBookingPayload } from '@/common/types/booking';
import {
  createBooking,
  fetchBookingBranches,
  fetchBookingClinic,
  fetchBookingDays,
  fetchBookingDoctors,
  fetchBookingServices,
  fetchBookingSlots,
  registerBookingPushToken,
} from '@/helpers/booking.api';
import { getMessagingInstance } from '@/helpers/firebase';
import { normalizePhone } from '@/helpers/phone';

export type BookingStep = 'service' | 'doctor' | 'datetime' | 'details' | 'done';

export type PushPermissionStatus = 'unsupported' | NotificationPermission;

const readPushPermission = (): PushPermissionStatus =>
  typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;

export type PatientDetailsValues = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  comment: string;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  notifyPush: boolean;
};

const EMPTY_DETAILS: PatientDetailsValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  comment: '',
  notifyEmail: true,
  notifyWhatsapp: true,
  notifyPush: true,
};

// Best-effort: silently does nothing if the browser denies permission, FCM
// isn't configured, or the widget isn't served over HTTPS.
const registerPushForBooking = async (clinicSlug: string, patientId: string): Promise<void> => {
  if (typeof Notification === 'undefined') return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });
  if (!token) return;

  await registerBookingPushToken(clinicSlug, patientId, token);
};

const toMonthValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const useBookingWizard = (clinicSlug: string) => {
  const [step, setStep] = useState<BookingStep>('service');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [doctorProfileId, setDoctorProfileId] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<PatientDetailsValues>(EMPTY_DETAILS);
  const [pushPermission, setPushPermission] = useState<PushPermissionStatus>(readPushPermission);

  const clinicQuery = useQuery({
    queryKey: ['booking', clinicSlug, 'clinic'],
    queryFn: ({ signal }) => fetchBookingClinic(clinicSlug, signal),
  });

  // Only needed to look up a branch's name/address once a doctor resolves
  // one — the patient is never asked to pick a branch themselves.
  const branchesQuery = useQuery({
    queryKey: ['booking', clinicSlug, 'branches'],
    queryFn: ({ signal }) => fetchBookingBranches(clinicSlug, signal),
  });

  const servicesQuery = useQuery({
    queryKey: ['booking', clinicSlug, 'services'],
    queryFn: ({ signal }) => fetchBookingServices(clinicSlug, signal),
  });

  const doctorsQuery = useQuery({
    queryKey: ['booking', clinicSlug, 'doctors', serviceId],
    queryFn: ({ signal }) =>
      fetchBookingDoctors(clinicSlug, { serviceId: serviceId as string }, signal),
    enabled:
      Boolean(serviceId) && (step === 'doctor' || step === 'datetime' || step === 'details'),
  });

  const allServices = useMemo(
    () => (servicesQuery.data ?? []).flatMap((category) => category.services),
    [servicesQuery.data],
  );

  const selectedService = allServices.find((service) => service.id === serviceId) ?? null;
  // Kept in react-query's cache even once the doctors query goes inactive
  // past the "doctor" step — so the picked doctor's info stays visible
  // alongside the day/time pickers and the details form.
  const selectedDoctor = doctorsQuery.data?.find((doctor) => doctor.id === doctorProfileId) ?? null;
  // Derived from the doctor, not chosen by the patient.
  const resolvedBranchId = selectedDoctor?.branchId ?? null;
  const selectedBranch =
    branchesQuery.data?.find((branch) => branch.id === resolvedBranchId) ?? null;

  const monthValue = toMonthValue(visibleMonth);

  const daysQuery = useQuery({
    queryKey: [
      'booking',
      clinicSlug,
      'days',
      doctorProfileId,
      serviceId,
      resolvedBranchId,
      monthValue,
    ],
    queryFn: ({ signal }) =>
      fetchBookingDays(
        clinicSlug,
        {
          doctorProfileId: doctorProfileId as string,
          serviceId: serviceId as string,
          branchId: resolvedBranchId as string,
          month: monthValue,
        },
        signal,
      ),
    enabled: step === 'datetime' && Boolean(doctorProfileId && serviceId && resolvedBranchId),
  });

  const slotsQuery = useQuery({
    queryKey: ['booking', clinicSlug, 'slots', doctorProfileId, serviceId, resolvedBranchId, date],
    queryFn: ({ signal }) =>
      fetchBookingSlots(
        clinicSlug,
        {
          doctorProfileId: doctorProfileId as string,
          serviceId: serviceId as string,
          branchId: resolvedBranchId as string,
          date: date as string,
        },
        signal,
      ),
    enabled: step === 'datetime' && Boolean(doctorProfileId && serviceId && resolvedBranchId && date),
  });

  const bookingMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(clinicSlug, payload),
    onSuccess: (confirmation) => {
      setStep('done');

      if (details.notifyPush) {
        registerPushForBooking(clinicSlug, confirmation.patientId)
          .catch(() => undefined)
          .finally(() => setPushPermission(readPushPermission()));
      }
    },
  });

  const enablePushNotifications = async (): Promise<void> => {
    const patientId = bookingMutation.data?.patientId;
    if (!patientId) return;

    await registerPushForBooking(clinicSlug, patientId).catch(() => undefined);
    setPushPermission(readPushPermission());
  };

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
    setStep('details');
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
    if (step === 'details') {
      setStep('datetime');
    }
  };

  const canGoBack = step === 'doctor' || step === 'datetime' || step === 'details';

  const submitBooking = () => {
    if (!resolvedBranchId || !serviceId || !doctorProfileId || !date || !time) return;

    bookingMutation.mutate({
      branchId: resolvedBranchId,
      serviceId,
      doctorProfileId,
      date,
      time,
      firstName: details.firstName.trim(),
      lastName: details.lastName.trim(),
      phone: normalizePhone(details.phone),
      email: details.email.trim() || undefined,
      comment: details.comment.trim() || undefined,
      notificationPreferences: {
        email: details.notifyEmail,
        whatsapp: details.notifyWhatsapp,
      },
    });
  };

  return {
    step,
    clinicQuery,
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
    details,
    setDetails,
    bookingMutation,
    pushPermission,
    enablePushNotifications,
    selectService,
    selectDoctor,
    selectDate,
    selectTime,
    goToPrevMonth,
    goToNextMonth,
    goBack,
    canGoBack,
    submitBooking,
  };
};
