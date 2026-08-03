'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPatientDevLoginCode } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_DEV_LOGIN_CODE_QUERY_KEY = 'patient-dev-login-code';

// Dev/QA only — the backend returns `code: null` in any real deployment
// (see OtpCodeEntity#devPlainCode), so this quietly resolves to nothing there.
export const usePatientDevLoginCode = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [PATIENT_DEV_LOGIN_CODE_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientDevLoginCode(accessToken, patientId, signal);
    },
    enabled: Boolean(accessToken),
    // The code changes every request/60s cooldown — a stale cache would just
    // show an old code, so always treat it as immediately stale.
    staleTime: 0,
  });

  return { code: query.data?.code ?? null };
};
