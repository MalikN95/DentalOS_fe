'use client';

import { useEffect, useState } from 'react';

const MOBILE_MEDIA_QUERY = '(max-width: 768px)';

const readIsMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(readIsMobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};
