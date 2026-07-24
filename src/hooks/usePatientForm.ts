'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { CreatePatientPayload, Patient, UpdatePatientPayload } from '@/common/types/patient';
import { createPatient, updatePatient } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

const patientFormSchema = z.object({
  firstName: z.string().trim().min(1, 'Укажите имя').max(120),
  lastName: z.string().trim().min(1, 'Укажите фамилию').max(120),
  phone: z.string().trim().min(1, 'Укажите телефон').max(32),
  email: z.union([z.literal(''), z.email('Некорректный email')]),
  birthDate: z.string(),
  gender: z.union([z.literal(''), z.enum(['male', 'female', 'other'])]),
  allergies: z.string(),
  chronicDiseases: z.string(),
  comments: z.string(),
  insuranceCompany: z.string(),
  insurancePolicyNumber: z.string(),
  insuranceValidUntil: z.string(),
  isActive: z.boolean(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

const EMPTY_VALUES: PatientFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: '',
  allergies: '',
  chronicDiseases: '',
  comments: '',
  insuranceCompany: '',
  insurancePolicyNumber: '',
  insuranceValidUntil: '',
  isActive: true,
};

const splitList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

const joinList = (value: string[] | null | undefined): string => (value ?? []).join(', ');

const patientToValues = (patient: Patient): PatientFormValues => ({
  firstName: patient.firstName,
  lastName: patient.lastName,
  phone: patient.phone,
  email: patient.email ?? '',
  birthDate: patient.birthDate ?? '',
  gender: patient.gender ?? '',
  allergies: joinList(patient.allergies),
  chronicDiseases: joinList(patient.chronicDiseases),
  comments: patient.comments ?? '',
  insuranceCompany: patient.insurance?.company ?? '',
  insurancePolicyNumber: patient.insurance?.policyNumber ?? '',
  insuranceValidUntil: patient.insurance?.validUntil ?? '',
  isActive: patient.isActive,
});

const valuesToPayload = (values: PatientFormValues): CreatePatientPayload => {
  const hasInsurance = Boolean(
    values.insuranceCompany.trim() && values.insurancePolicyNumber.trim(),
  );

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim() || undefined,
    birthDate: values.birthDate || undefined,
    gender: values.gender || undefined,
    allergies: splitList(values.allergies),
    chronicDiseases: splitList(values.chronicDiseases),
    comments: values.comments.trim() || undefined,
    insurance: hasInsurance
      ? {
          company: values.insuranceCompany.trim(),
          policyNumber: values.insurancePolicyNumber.trim(),
          validUntil: values.insuranceValidUntil || null,
        }
      : undefined,
  };
};

type UsePatientFormParams = {
  patient?: Patient | null;
  onSuccess?: () => void;
};

export const usePatientForm = ({ patient, onSuccess }: UsePatientFormParams) => {
  const accessToken = useAppSelector(selectAccessToken);
  const isEditMode = Boolean(patient);

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patient ? patientToValues(patient) : EMPTY_VALUES,
  });

  const { reset } = form;

  useEffect(() => {
    reset(patient ? patientToValues(patient) : EMPTY_VALUES);
  }, [patient, reset]);

  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const payload = valuesToPayload(values);

      if (patient) {
        const updatePayload: UpdatePatientPayload = { ...payload, isActive: values.isActive };
        return updatePatient(accessToken, patient.id, updatePayload);
      }

      return createPatient(accessToken, payload);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });

  return { form, mutation, isEditMode };
};
