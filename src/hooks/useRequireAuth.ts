'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

/**
 * Route guard: redirects to /login when there is no access token.
 * Applied once at the dashboard layout level, so every page under it is protected.
 */
export const useRequireAuth = (): { isAuthenticated: boolean } => {
  const router = useRouter();
  const accessToken = useAppSelector(selectAccessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
    }
  }, [accessToken, router]);

  return { isAuthenticated: Boolean(accessToken) };
};
