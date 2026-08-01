export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

// Root domain — the kabinet and booking widget live at app.APP_DOMAIN;
// the bare domain shows the marketing landing page (see src/middleware.ts).
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';
