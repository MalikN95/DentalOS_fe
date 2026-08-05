'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ApiRequestError } from '@/helpers/api-fetch';
import { requestPatientLoginLink } from '@/helpers/patient-portal.api';

const PHONE_PATTERN = /^\+?\d{10,15}$/u;
const RESEND_COOLDOWN_SECONDS = 60;

export type PortalLoginStep = 'phone' | 'sent';

export const usePortalLogin = (clinicSlug: string) => {
  const { t } = useTranslation();

  const [step, setStep] = useState<PortalLoginStep>('phone');
  const [phone, setPhone] = useState('');
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

  const requestLink = async (): Promise<void> => {
    if (!PHONE_PATTERN.test(phone.trim())) {
      setError(t.patientPortal.invalidPhone);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await requestPatientLoginLink(clinicSlug, phone.trim());
      setStep('sent');
      startCooldown();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : t.patientPortal.genericError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changePhone = (): void => {
    setStep('phone');
    setError(null);
  };

  const resendLink = async (): Promise<void> => {
    if (resendCooldown > 0) return;
    await requestLink();
  };

  return {
    step,
    phone,
    setPhone,
    isSubmitting,
    error,
    resendCooldown,
    requestLink,
    changePhone,
    resendLink,
  };
};
