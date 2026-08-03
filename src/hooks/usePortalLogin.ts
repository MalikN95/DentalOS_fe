'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ApiRequestError } from '@/helpers/api-fetch';
import { decodeJwtPayload } from '@/helpers/jwt';
import { requestPatientOtp, verifyPatientOtp } from '@/helpers/patient-portal.api';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/auth/auth.slice';

const PHONE_PATTERN = /^\+?\d{10,15}$/u;
const CODE_PATTERN = /^\d{4}$/u;
const RESEND_COOLDOWN_SECONDS = 60;

export type PortalLoginStep = 'phone' | 'code';

export const usePortalLogin = (clinicSlug: string) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<PortalLoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    if (cooldownTimer.current) {
      clearInterval(cooldownTimer.current);
    }

    cooldownTimer.current = setInterval(() => {
      setResendCooldown((seconds) => {
        if (seconds <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
        }
        return Math.max(0, seconds - 1);
      });
    }, 1000);
  };

  useEffect(
    () => () => {
      if (cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
      }
    },
    [],
  );

  const requestCode = async (): Promise<void> => {
    if (!PHONE_PATTERN.test(phone.trim())) {
      setError(t.patientPortal.invalidPhone);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestPatientOtp(clinicSlug, phone.trim());
      setStep('code');
      startCooldown();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t.patientPortal.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (): Promise<void> => {
    if (!CODE_PATTERN.test(code.trim())) {
      setError(t.patientPortal.invalidCode);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const tokens = await verifyPatientOtp(clinicSlug, phone.trim(), code.trim());
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
      setError(err instanceof ApiRequestError ? err.message : t.patientPortal.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePhone = (): void => {
    setStep('phone');
    setCode('');
    setError(null);
  };

  const resendCode = async (): Promise<void> => {
    if (resendCooldown > 0) return;
    await requestCode();
  };

  return {
    step,
    phone,
    setPhone,
    code,
    setCode,
    isSubmitting,
    error,
    resendCooldown,
    requestCode,
    verifyCode,
    changePhone,
    resendCode,
  };
};
