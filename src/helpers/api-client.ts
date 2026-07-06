import createClient from 'openapi-fetch';
import { API_URL } from '@/common/constants/env';
import type { ApiPaths } from '@/common/types/api';

export const apiClient = createClient<ApiPaths>({
  baseUrl: API_URL,
  credentials: 'include',
});

export const setAuthHeader = (accessToken: string | null): void => {
  apiClient.use({
    onRequest({ request }) {
      if (accessToken) {
        request.headers.set('Authorization', `Bearer ${accessToken}`);
      }
      return request;
    },
  });
};
