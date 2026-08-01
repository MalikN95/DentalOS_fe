import { getApps, initializeApp } from 'firebase/app';
import type { Messaging } from 'firebase/messaging';
import { getMessaging, isSupported } from 'firebase/messaging';
import { FIREBASE_CONFIG } from '@/common/constants/env';

export const isFirebaseConfigured = (): boolean =>
  Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId && FIREBASE_CONFIG.appId);

let messagingPromise: Promise<Messaging | null> | null = null;

/** Lazily initializes Firebase and returns a Messaging instance, or null if unconfigured/unsupported. */
export const getMessagingInstance = (): Promise<Messaging | null> => {
  if (typeof window === 'undefined' || !isFirebaseConfigured()) {
    return Promise.resolve(null);
  }

  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported) return null;

      const app = getApps()[0] ?? initializeApp(FIREBASE_CONFIG);
      return getMessaging(app);
    });
  }

  return messagingPromise;
};
