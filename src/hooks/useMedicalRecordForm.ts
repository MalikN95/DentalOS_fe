'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { Appointment } from '@/common/types/appointment';
import type { ApiMedicalRecord } from '@/common/types/visit';
import { createMedicalRecord, updateMedicalRecord } from '@/helpers/medical-records.api';
import { fetchPatientMedicalRecords } from '@/helpers/patients.api';
import { PATIENT_DETAIL_QUERY_KEY } from '@/hooks/usePatientDetail';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const medicalRecordFormSchema = z.object({
  complaints: z.string(),
  examination: z.string(),
  diagnosis: z.string().trim().min(1, 'Укажите диагноз'),
  treatment: z.string(),
  prescriptions: z.string(),
  recommendations: z.string(),
  notes: z.string(),
});

export type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

const EMPTY_VALUES: MedicalRecordFormValues = {
  complaints: '',
  examination: '',
  diagnosis: '',
  treatment: '',
  prescriptions: '',
  recommendations: '',
  notes: '',
};

const recordToValues = (record: ApiMedicalRecord): MedicalRecordFormValues => ({
  complaints: record.complaints ?? '',
  examination: record.examination ?? '',
  diagnosis: record.diagnosis,
  treatment: record.treatment ?? '',
  prescriptions: record.prescriptions ?? '',
  recommendations: record.recommendations ?? '',
  notes: record.notes ?? '',
});

type UseMedicalRecordFormParams = {
  appointment: Appointment;
  onSaved?: (record: ApiMedicalRecord) => void;
};

export const useMedicalRecordForm = ({ appointment, onSaved }: UseMedicalRecordFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const recordsQuery = useQuery({
    queryKey: [PATIENT_DETAIL_QUERY_KEY, appointment.patientId, 'records'],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientMedicalRecords(accessToken, appointment.patientId, 200, signal);
    },
    enabled: Boolean(accessToken),
  });

  const existingRecord = useMemo(
    () => recordsQuery.data?.items.find((item) => item.appointmentId === appointment.id) ?? null,
    [recordsQuery.data, appointment.id],
  );

  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(existingRecord ? recordToValues(existingRecord) : EMPTY_VALUES);
  }, [existingRecord, reset]);

  const mutation = useMutation({
    mutationFn: (values: MedicalRecordFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const payload = {
        complaints: values.complaints.trim() || undefined,
        examination: values.examination.trim() || undefined,
        diagnosis: values.diagnosis.trim(),
        treatment: values.treatment.trim() || undefined,
        prescriptions: values.prescriptions.trim() || undefined,
        recommendations: values.recommendations.trim() || undefined,
        notes: values.notes.trim() || undefined,
      };

      if (existingRecord) {
        return updateMedicalRecord(accessToken, existingRecord.id, payload);
      }

      return createMedicalRecord(accessToken, {
        ...payload,
        patientId: appointment.patientId,
        appointmentId: appointment.id,
        doctorProfileId: appointment.doctorProfileId,
      });
    },
    onSuccess: (record) => {
      queryClient
        .invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY, appointment.patientId] })
        .catch(() => undefined);
      onSaved?.(record);
    },
  });

  return {
    form,
    mutation,
    isLoading: recordsQuery.isLoading,
    existingRecord,
  };
};
