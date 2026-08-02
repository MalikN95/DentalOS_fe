'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTeamChatMessages } from '@/helpers/chat.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TEAM_CHAT_QUERY_KEY = 'team-chat-messages';

const LIMIT = 50;
// Not wired to the WebSocket gateway yet (see events module) — polls like
// the notification bell does, just faster for a chat to feel responsive.
const POLL_INTERVAL_MS = 4000;

export const useTeamChatMessages = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [TEAM_CHAT_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchTeamChatMessages(accessToken, { page: 1, limit: LIMIT }, signal);
    },
    enabled: Boolean(accessToken),
    refetchInterval: POLL_INTERVAL_MS,
  });

  // API returns newest-first (page 1 of a DESC order); the thread renders oldest-to-newest.
  const messages = [...(query.data?.items ?? [])].reverse();

  return { messages, isLoading: query.isLoading, errorMessage: query.error?.message ?? null };
};
