'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/helpers/notifications.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const NOTIFICATIONS_QUERY_KEY = 'notifications';

// The bell isn't wired to the WebSocket gateway (see events module) yet, so it
// polls — frequent enough to feel live, cheap enough to leave always-on.
const POLL_INTERVAL_MS = 30_000;
const LIMIT = 10;

export const useNotifications = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchNotifications(accessToken, { page: 1, limit: LIMIT }, signal);
    },
    enabled: Boolean(accessToken),
    refetchInterval: POLL_INTERVAL_MS,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] }).catch(() => undefined);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return markNotificationRead(accessToken, id);
    },
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => {
      if (!accessToken) throw new Error('Not authenticated');
      return markAllNotificationsRead(accessToken);
    },
    onSuccess: invalidate,
  });

  return {
    notifications: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
  };
};
