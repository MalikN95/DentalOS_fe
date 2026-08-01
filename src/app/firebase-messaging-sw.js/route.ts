// Serves the FCM service worker at /firebase-messaging-sw.js. A static file in
// `public/` can't read env vars, so this is a route handler instead — it
// injects the (public, non-secret) Firebase web config server-side.
const FIREBASE_SDK_VERSION = '12.17.0';

export const GET = () => {
  const script = `
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''}',
  projectId: '${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ''}',
  messagingSenderId: '${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? ''}',
  appId: '${process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ''}',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification && payload.notification.title ? payload.notification.title : 'DentalOS';
  const body = payload.notification ? payload.notification.body : undefined;
  self.registration.showNotification(title, { body, icon: '/logo-default.svg' });
});
`;

  return new Response(script, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
};
