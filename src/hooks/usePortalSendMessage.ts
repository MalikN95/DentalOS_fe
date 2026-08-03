'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMyMessage } from '@/helpers/patient-portal.api';
import { PORTAL_MESSAGES_QUERY_KEY } from '@/hooks/usePortalMessages';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const usePortalSendMessage = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return sendMyMessage(accessToken, body);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [PORTAL_MESSAGES_QUERY_KEY] })
        .catch(() => undefined);
    },
  });
};
