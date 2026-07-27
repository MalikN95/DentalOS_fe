'use client';

import { useCallback, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { InvoiceStatus } from '@/common/types/finance';
import { fetchInvoices } from '@/helpers/invoices.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const INVOICES_QUERY_KEY = 'invoices';

const DEFAULT_LIMIT = 20;

type UseInvoicesParams = {
  from: string;
  to: string;
};

export const useInvoices = ({ from, to }: UseInvoicesParams) => {
  const accessToken = useAppSelector(selectAccessToken);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [status, setStatus] = useState<InvoiceStatus | null>(null);

  // A new date range makes the previous page number meaningless — reset it
  // during render (see "Adjusting state when a prop changes" in the React docs)
  // rather than in an effect, which would cost an extra render pass.
  const [rangeForReset, setRangeForReset] = useState({ from, to });
  if (rangeForReset.from !== from || rangeForReset.to !== to) {
    setRangeForReset({ from, to });
    setPage(1);
  }

  const query = useQuery({
    queryKey: [INVOICES_QUERY_KEY, { page, limit, status, from, to }],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchInvoices(
        accessToken,
        { page, limit, status: status ?? undefined, from, to },
        signal,
      );
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const total = query.data?.total ?? 0;

  const handleStatusChange = useCallback((next: InvoiceStatus | null) => {
    setStatus(next);
    setPage(1);
  }, []);

  const handleLimitChange = useCallback((next: number) => {
    setLimit(next);
    setPage(1);
  }, []);

  return {
    query,
    invoices: query.data?.items ?? [],
    total,
    page,
    limit,
    status,
    setPage,
    setLimit: handleLimitChange,
    setStatus: handleStatusChange,
  };
};
