'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreatePatientTagPayload, UpdatePatientTagPayload } from '@/common/types/patient-tag';
import {
  createPatientTag,
  deletePatientTag,
  fetchPatientTags,
  updatePatientTag,
} from '@/helpers/patient-tags.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_TAGS_QUERY_KEY = 'patient-tags';

// The clinic-wide tag catalog: every tag available to assign to a patient,
// defaults included (seeded lazily server-side on first request).
export const usePatientTagCatalog = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PATIENT_TAGS_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientTags(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PATIENT_TAGS_QUERY_KEY] }).catch(() => undefined);

  const createMutation = useMutation({
    mutationFn: (payload: CreatePatientTagPayload) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createPatientTag(accessToken, payload);
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePatientTagPayload }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updatePatientTag(accessToken, id, payload);
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deletePatientTag(accessToken, id);
    },
    onSuccess: invalidate,
  });

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
