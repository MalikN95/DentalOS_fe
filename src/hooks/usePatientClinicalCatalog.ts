'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAllergiesCatalog, fetchChronicDiseasesCatalog } from '@/helpers/patients.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const ALLERGIES_CATALOG_QUERY_KEY = 'allergies-catalog';
export const CHRONIC_DISEASES_CATALOG_QUERY_KEY = 'chronic-diseases-catalog';

export const useAllergiesCatalog = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [ALLERGIES_CATALOG_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchAllergiesCatalog(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return { options: query.data ?? [], isLoading: query.isLoading };
};

export const useChronicDiseasesCatalog = () => {
  const accessToken = useAppSelector(selectAccessToken);

  const query = useQuery({
    queryKey: [CHRONIC_DISEASES_CATALOG_QUERY_KEY],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchChronicDiseasesCatalog(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  return { options: query.data ?? [], isLoading: query.isLoading };
};
