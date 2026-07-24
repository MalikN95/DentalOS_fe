'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppointmentStatus } from '@/common/types/appointment';
import type { ApiVisit, Visit } from '@/common/types/visit';
import {
  fetchPatient,
  fetchPatientHistory,
  fetchPatientMedicalRecords,
} from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_DETAIL_QUERY_KEY = 'patient-detail';

const CLOSED_STATUSES: AppointmentStatus[] = ['completed', 'cancelled', 'no_show'];

const formatDoctor = (doctorProfile: ApiVisit['doctorProfile']): string => {
  if (!doctorProfile) return '—';
  return `${doctorProfile.user.lastName} ${doctorProfile.user.firstName}`.trim();
};

export const usePatientDetail = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  // Captured once at mount; splitting upcoming/past doesn't need a live clock.
  const [now] = useState(() => Date.now());

  const patientQuery = useQuery({
    queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId, 'patient'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatient(accessToken, patientId, signal);
    },
    enabled: Boolean(accessToken),
  });

  const historyQuery = useQuery({
    queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId, 'history'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientHistory(accessToken, patientId, 100, signal);
    },
    enabled: Boolean(accessToken),
  });

  const recordsQuery = useQuery({
    queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId, 'records'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientMedicalRecords(accessToken, patientId, 100, signal);
    },
    enabled: Boolean(accessToken),
  });

  const { upcoming, past } = useMemo(() => {
    const visits = historyQuery.data?.items ?? [];
    const records = recordsQuery.data?.items ?? [];

    const recordByAppointment = new Map(
      records
        .filter((record) => record.appointmentId)
        .map((record) => [record.appointmentId, record]),
    );

    const mapped: Visit[] = visits.map((visit) => ({
      id: visit.id,
      startsAt: visit.startsAt,
      status: visit.status,
      price: visit.price,
      serviceName: visit.service?.name ?? '—',
      doctorName: formatDoctor(visit.doctorProfile),
      cabinetName: visit.cabinet?.name ?? null,
      branchName: visit.branch?.name ?? null,
      comment: visit.comment,
      record: recordByAppointment.get(visit.id) ?? null,
    }));

    const isUpcoming = (visit: Visit) =>
      new Date(visit.startsAt).getTime() >= now && !CLOSED_STATUSES.includes(visit.status);

    return {
      // history comes DESC; upcoming should read nearest-first
      upcoming: mapped.filter(isUpcoming).reverse(),
      past: mapped.filter((visit) => !isUpcoming(visit)),
    };
  }, [historyQuery.data, recordsQuery.data, now]);

  return {
    patient: patientQuery.data ?? null,
    patientQuery,
    upcoming,
    past,
    isLoading: patientQuery.isLoading || historyQuery.isLoading,
    isVisitsLoading: historyQuery.isLoading || recordsQuery.isLoading,
    errorMessage: patientQuery.error?.message ?? historyQuery.error?.message ?? null,
  };
};
