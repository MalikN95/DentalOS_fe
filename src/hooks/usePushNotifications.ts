'use client';

import { useCallback, useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { FIREBASE_VAPID_KEY } from '@/common/constants/env';
import { getMessagingInstance, isFirebaseConfigured } from '@/helpers/firebase';
import { registerPushToken } from '@/helpers/notifications.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export type PushPermissionStatus = 'unsupported' | 'default' | 'denied' | 'granted';

type ForegroundMessage = {
  title: string;
  body: string;
};

const readInitialStatus = (): PushPermissionStatus => {
  if (
    typeof window === 'undefined' ||
    !isFirebaseConfigured() ||
    typeof Notification === 'undefined'
  ) {
    return 'unsupported';
  }

  return Notification.permission;
};

export const usePushNotifications = (onForegroundMessage?: (message: ForegroundMessage) => void) => {
  const accessToken = useAppSelector(selectAccessToken);
  const [status, setStatus] = useState<PushPermissionStatus>(readInitialStatus);

  useEffect(() => {
    if (status !== 'granted') return undefined;

    let unsubscribe: (() => void) | undefined;

    getMessagingInstance().then((messaging) => {
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        onForegroundMessage?.({
          title: payload.notification?.title ?? 'DentalOS',
          body: payload.notification?.body ?? '',
        });
      });
    });

    return () => unsubscribe?.();
  }, [status, onForegroundMessage]);

  const enablePush = useCallback(async (): Promise<boolean> => {
    if (!accessToken || typeof Notification === 'undefined') return false;

    const permission = await Notification.requestPermission();
    setStatus(permission);

    if (permission !== 'granted') return false;

    const messaging = await getMessagingInstance();
    if (!messaging) return false;

    const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });

    if (!token) return false;

    await registerPushToken(accessToken, token);
    return true;
  }, [accessToken]);

  return { status, enablePush };
};
