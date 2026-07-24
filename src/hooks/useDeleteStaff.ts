'use client';

import { useMutation } from '@tanstack/react-query';
import { deleteStaff } from '@/helpers/staff.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

type UseDeleteStaffParams = {
  onSuccess?: () => void;
};

export const useDeleteStaff = ({ onSuccess }: UseDeleteStaffParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return deleteStaff(accessToken, id);
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
