const COOKIE_NAME = 'dentalos_cookie_consent';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 12 months

export type CookieConsentValue = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export const readCookieConsent = (): CookieConsentValue | null => {
  if (typeof document === 'undefined') return null;

  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? (JSON.parse(decodeURIComponent(match[1])) as CookieConsentValue) : null;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (value: CookieConsentValue): void => {
  if (typeof document === 'undefined') return;

  try {
    const encoded = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${COOKIE_NAME}=${encoded}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; samesite=lax`;
  } catch {
    // ignore serialization errors
  }
};

export const OPEN_COOKIE_PREFERENCES_EVENT = 'dentalos:open-cookie-preferences';

export const openCookiePreferences = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
};
