import { APP_DOMAIN } from '@/common/constants/env';

// Full public URL of a clinic's own booking page, e.g. https://app.dentalos.com/book/smile —
// mirrors the current protocol/port (dev runs with a port, prod typically doesn't).
export const buildClinicBookingUrl = (slug: string): string => {
  if (typeof window === 'undefined') {
    return `https://app.${APP_DOMAIN}/book/${slug}`;
  }

  const { protocol, port } = window.location;
  const portSuffix = port ? `:${port}` : '';

  return `${protocol}//app.${APP_DOMAIN}${portSuffix}/book/${slug}`;
};
