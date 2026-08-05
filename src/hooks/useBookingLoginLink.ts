'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { requestPatientLoginLink } from '@/helpers/patient-portal.api';

export type BookingLoginLinkStatus = 'idle' | 'sending' | 'sent' | 'error';

// Sends the WhatsApp login link using the phone the patient just typed into
// the booking form — no separate phone entry, no code. Still requires
// tapping the link in WhatsApp to actually authenticate (SmsAuthService
// only issues tokens off that unguessable token, never off a bare phone
// number), so a booking made with someone else's phone can't log the caller
// into that person's portal account.
export const useBookingLoginLink = (clinicSlug: string, phone: string) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BookingLoginLinkStatus>('idle');

  const sendLink = async (): Promise<void> => {
    if (status === 'sending' || status === 'sent') return;

    setStatus('sending');

    try {
      await requestPatientLoginLink(clinicSlug, phone);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const errorMessage = status === 'error' ? t.booking.confirmationPortalError : null;

  return { status, errorMessage, sendLink };
};
