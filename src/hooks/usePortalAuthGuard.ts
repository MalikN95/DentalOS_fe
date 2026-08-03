'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser, selectIsAuthenticated, selectIsPatient } from '@/store/slices/auth/selectors';

/**
 * Route guard for the patient portal: redirects to that patient's own
 * clinic login (or the marketing page if the clinic is unknown) unless the
 * signed-in user is authenticated with the `patient` role.
 */
export const usePortalAuthGuard = (): { isAuthorized: boolean } => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isPatient = useAppSelector(selectIsPatient);
  const user = useAppSelector(selectCurrentUser);

  const isAuthorized = isAuthenticated && isPatient;

  useEffect(() => {
    if (isAuthorized) return;

    router.replace(user?.clinicSlug ? `/portal/${user.clinicSlug}` : '/');
  }, [isAuthorized, router, user?.clinicSlug]);

  return { isAuthorized };
};
