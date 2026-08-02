export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

// Root domain — landing page, kabinet (login/dashboard), and the public
// booking widget all live on this single host, split by path, not subdomain.
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';

// Firebase Cloud Messaging (web push). Blank in dev until configured — the
// push-notifications helper no-ops (no permission prompt) when these are empty.
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? '';
