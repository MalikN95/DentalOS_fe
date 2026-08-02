import { APP_DOMAIN } from '@/common/constants/env';

// Full public URL of a clinic's own booking page, e.g. https://dentalos.com/book/smile.
export const buildClinicBookingUrl = (slug: string): string => {
  if (typeof window === 'undefined') {
    return `https://${APP_DOMAIN}/book/${slug}`;
  }

  return `${window.location.origin}/book/${slug}`;
};
