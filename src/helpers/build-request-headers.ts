import { getClinicSubdomain } from '@/helpers/tenant';

export const buildRequestHeaders = (accessToken: string | null, init?: HeadersInit): Headers => {
  const headers = new Headers(init);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('X-Clinic-Subdomain', getClinicSubdomain());

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
};
