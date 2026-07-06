import { APP_DOMAIN, CLINIC_SUBDOMAIN_FALLBACK } from '@/common/constants/env';

export const extractSubdomainFromHostname = (
  hostname: string,
  appDomain: string,
): string | null => {
  const host = hostname.split(':')[0];

  if (!host.endsWith(`.${appDomain}`)) {
    return null;
  }

  const subdomain = host.slice(0, -(appDomain.length + 1));

  if (!subdomain || subdomain === 'www' || subdomain.includes('.')) {
    return null;
  }

  return subdomain;
};

export const getClinicSubdomain = (): string => {
  if (typeof window !== 'undefined') {
    const fromUrl = extractSubdomainFromHostname(window.location.hostname, APP_DOMAIN);

    if (fromUrl) {
      return fromUrl;
    }
  }

  return CLINIC_SUBDOMAIN_FALLBACK;
};
