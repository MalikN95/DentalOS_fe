import type {
  ApiInvoice,
  ApiInvoiceWithPayments,
  CreateInvoicePayload,
  ListInvoicesParams,
} from '@/common/types/finance';
import type { PaginatedResult } from '@/common/types/pagination';
import { apiFetch } from '@/helpers/api-fetch';

export const fetchPatientInvoices = (
  accessToken: string,
  patientId: string,
  limit = 100,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiInvoice>> =>
  apiFetch<PaginatedResult<ApiInvoice>>(
    accessToken,
    `/api/invoices?patientId=${patientId}&page=1&limit=${limit}`,
    { signal },
  );

export const fetchInvoices = (
  accessToken: string,
  { page, limit, status, from, to }: ListInvoicesParams,
  signal?: AbortSignal,
): Promise<PaginatedResult<ApiInvoice>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (status) params.set('status', status);
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  return apiFetch<PaginatedResult<ApiInvoice>>(accessToken, `/api/invoices?${params.toString()}`, {
    signal,
  });
};

export const fetchInvoice = (
  accessToken: string,
  id: string,
  signal?: AbortSignal,
): Promise<ApiInvoiceWithPayments> =>
  apiFetch<ApiInvoiceWithPayments>(accessToken, `/api/invoices/${id}`, { signal });

export const createInvoice = (
  accessToken: string,
  payload: CreateInvoicePayload,
): Promise<ApiInvoice> =>
  apiFetch<ApiInvoice>(accessToken, '/api/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
