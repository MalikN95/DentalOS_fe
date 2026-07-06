export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4000';

// Root domain for tenant subdomains: {clinic}.APP_DOMAIN (must match backend APP_DOMAIN)
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';

// Used only when the app is opened without a subdomain (e.g. http://localhost:3000)
export const CLINIC_SUBDOMAIN_FALLBACK = process.env.NEXT_PUBLIC_CLINIC_SUBDOMAIN ?? 'smile';
