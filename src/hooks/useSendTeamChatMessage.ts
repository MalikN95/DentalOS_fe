'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendTeamChatMessage } from '@/helpers/chat.api';
import { TEAM_CHAT_QUERY_KEY } from '@/hooks/useTeamChatMessages';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const useSendTeamChatMessage = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return sendTeamChatMessage(accessToken, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_CHAT_QUERY_KEY] }).catch(() => undefined);
    },
  });
};
