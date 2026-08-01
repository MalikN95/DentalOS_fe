import type { NotificationList } from '@/common/types/notification';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchNotifications = (
  accessToken: string,
  params: { page: number; limit: number; unreadOnly?: boolean },
  signal?: AbortSignal,
): Promise<NotificationList> => {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    ...(params.unreadOnly ? { unreadOnly: 'true' } : {}),
  });

  return apiFetch<NotificationList>(accessToken, `/api/notifications?${query.toString()}`, {
    signal,
  });
};

export const markNotificationRead = (accessToken: string, id: string): Promise<void> =>
  apiFetch<void>(accessToken, `/api/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = (accessToken: string): Promise<void> =>
  apiFetch<void>(accessToken, '/api/notifications/read-all', { method: 'PATCH' });

export const registerPushToken = (accessToken: string, token: string): Promise<void> =>
  apiFetch<void>(accessToken, '/api/notifications/push-subscriptions', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

export const unregisterPushToken = (accessToken: string, token: string): Promise<void> =>
  apiFetch<void>(accessToken, '/api/notifications/push-subscriptions', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
