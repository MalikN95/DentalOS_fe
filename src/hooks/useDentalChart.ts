'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateToothMarkPayload } from '@/common/types/dental-chart';
import { addToothMark, fetchDentalChart } from '@/helpers/dental-chart.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const DENTAL_CHART_QUERY_KEY = 'dental-chart';

export const useDentalChart = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [DENTAL_CHART_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchDentalChart(accessToken, patientId, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  const addMark = useMutation({
    mutationFn: (payload: CreateToothMarkPayload) => {
      if (!accessToken) throw new Error('Not authenticated');
      return addToothMark(accessToken, patientId, payload);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: [DENTAL_CHART_QUERY_KEY, patientId] })
        .catch(() => undefined);
    },
  });

  return {
    chart: query.data ?? [],
    isLoading: query.isLoading,
    addMark,
  };
};
