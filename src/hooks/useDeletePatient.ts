'use client';

import { useMutation } from '@tanstack/react-query';
import { deletePatient } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseDeletePatientParams = {
  onSuccess?: () => void;
};

export const useDeletePatient = ({ onSuccess }: UseDeletePatientParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return deletePatient(accessToken, id);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
