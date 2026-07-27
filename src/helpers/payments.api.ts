import type { ApiPayment, CreatePaymentPayload } from '@/common/types/finance';
import { apiFetch } from '@/helpers/api-fetch';

export const createPayment = (
  accessToken: string,
  payload: CreatePaymentPayload,
): Promise<ApiPayment> =>
  apiFetch<ApiPayment>(accessToken, '/api/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
