'use client';

import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteTreatmentPlan, fetchTreatmentPlans } from '@/helpers/treatment-plans.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TREATMENT_PLANS_QUERY_KEY = 'treatment-plans';

const DEFAULT_LIMIT = 20;

type UseTreatmentPlansFilters = {
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const useTreatmentPlans = ({ patientId, dateFrom, dateTo }: UseTreatmentPlansFilters = {}) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  // A filter change makes the previous page number meaningless — reset it
  // during render (see "Adjusting state when a prop changes" in the React
  // docs) rather than in an effect, which would cost an extra render pass.
  const [filtersForReset, setFiltersForReset] = useState({ patientId, dateFrom, dateTo });
  if (
    filtersForReset.patientId !== patientId ||
    filtersForReset.dateFrom !== dateFrom ||
    filtersForReset.dateTo !== dateTo
  ) {
    setFiltersForReset({ patientId, dateFrom, dateTo });
    setPage(1);
  }

  const query = useQuery({
    queryKey: [TREATMENT_PLANS_QUERY_KEY, 'list', { page, limit, patientId, dateFrom, dateTo }],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchTreatmentPlans(
        accessToken,
        { page, limit, patientId, createdFrom: dateFrom, createdTo: dateTo },
        signal,
      );
    },
    enabled: Boolean(accessToken),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteTreatmentPlan(accessToken, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TREATMENT_PLANS_QUERY_KEY] }).catch(() => undefined);
    },
  });

  const handleLimitChange = (next: number) => {
    setLimit(next);
    setPage(1);
  };

  return {
    plans: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    page,
    limit,
    setPage,
    setLimit: handleLimitChange,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    deleteMutation,
  };
};
