'use client';

import { useSyncExternalStore } from 'react';
import { CLINIC_SUBDOMAIN_FALLBACK } from '@/common/constants/env';
import { getClinicSubdomain } from '@/helpers/tenant';

const subscribe = () => () => {};

export const useClinicSubdomain = (): string =>
  useSyncExternalStore(subscribe, getClinicSubdomain, () => CLINIC_SUBDOMAIN_FALLBACK);
