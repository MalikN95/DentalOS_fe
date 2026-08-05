'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser, selectIsAuthenticated, selectIsPatient } from '@/store/slices/auth/selectors';

/**
 * Sends an already-logged-in patient straight to their portal cabinet
 * instead of the public booking wizard — only when the signed-in account
 * belongs to *this* clinic (`user.clinicSlug` matches the page's `:slug`);
 * a patient logged into a different clinic still sees this clinic's public
 * booking flow as a guest.
 */
export const useBookingPortalRedirect = (clinicSlug: string): { isRedirecting: boolean } => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPatient = useAppSelector(selectIsPatient);
  const user = useAppSelector(selectCurrentUser);

  const isRedirecting = isAuthenticated && isPatient && user?.clinicSlug === clinicSlug;

  useEffect(() => {
    if (isRedirecting) {
      router.replace('/patient');
    }
  }, [isRedirecting, router]);

  return { isRedirecting };
};
