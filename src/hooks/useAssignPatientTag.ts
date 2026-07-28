'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assignPatientTag, unassignPatientTag } from '@/helpers/patients.api';
import { PATIENT_DETAIL_QUERY_KEY } from '@/hooks/usePatientDetail';
import { PATIENTS_QUERY_KEY } from '@/hooks/usePatients';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

// Assigns/unassigns a tag on one patient — separate from the tag catalog
// itself (usePatientTagCatalog), which manages the clinic-wide tag list.
export const useAssignPatientTag = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient
      .invalidateQueries({ queryKey: [PATIENT_DETAIL_QUERY_KEY, patientId] })
      .catch(() => undefined);
    queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] }).catch(() => undefined);
  };

  const addMutation = useMutation({
    mutationFn: (tagId: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return assignPatientTag(accessToken, patientId, tagId);
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (tagId: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return unassignPatientTag(accessToken, patientId, tagId);
    },
    onSuccess: invalidate,
  });

  return { addMutation, removeMutation };
};
