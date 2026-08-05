'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ApiRequestError } from '@/helpers/api-fetch';
import { decodeJwtPayload } from '@/helpers/jwt';
import { verifyPatientMagicLink } from '@/helpers/patient-portal.api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth/auth.slice';

export type MagicLoginStatus = 'idle' | 'verifying' | 'error';

// Deliberately does nothing on mount — WhatsApp (and most chat apps) prefetch
// shared links to render a preview, which would consume this single-use
// token before the patient ever taps it. Verification only fires from the
// explicit button click below.
export const useMagicLogin = (clinicSlug: string, token: string | null) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [status, setStatus] = useState<MagicLoginStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const login = async (): Promise<void> => {
    if (!token) {
      setStatus('error');
      setError(t.patientPortal.magicInvalid);
      return;
    }

    setStatus('verifying');
    setError(null);

    try {
      const tokens = await verifyPatientMagicLink(clinicSlug, token);
      const payload = decodeJwtPayload(tokens.accessToken);

      dispatch(
        setCredentials({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: payload.sub,
            clinicId: payload.clinicId,
            role: payload.role,
            email: '',
            firstName: '',
            lastName: '',
            clinicSlug,
          },
        }),
      );

      router.push('/patient');
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof ApiRequestError ? err.message : t.patientPortal.magicInvalid,
      );
    }
  };

  return { status, error, login };
};
