import { API_URL } from '@/common/constants/env';
import { refreshAccessToken } from '@/helpers/auth-bridge';
import { buildRequestHeaders } from '@/helpers/build-request-headers';

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export const parseApiError = async (response: Response): Promise<string> => {
  const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(', ')
    : errorBody?.message;

  return message ?? `Request failed (${response.status})`;
};

export const apiFetch = async <T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
  allowRefresh = true,
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: buildRequestHeaders(accessToken, init?.headers),
  });

  // Access token likely expired — try a one-shot refresh, then replay the request.
  if (response.status === 401 && allowRefresh) {
    const nextAccessToken = await refreshAccessToken();

    if (nextAccessToken) {
      return apiFetch<T>(nextAccessToken, path, init, false);
    }

    // Refresh failed: the bridge has already logged the user out.
    throw new ApiRequestError('Unauthorized');
  }

  if (response.ok === false) {
    throw new ApiRequestError(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
