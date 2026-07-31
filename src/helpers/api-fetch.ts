import { API_URL } from '@/common/constants/env';
import { refreshAccessToken } from '@/helpers/auth-bridge';
import { buildRequestHeaders } from '@/helpers/build-request-headers';

type ApiErrorBody = {
  message?: string | string[];
  /** Machine-readable reason (e.g. "OUTSIDE_WORKING_HOURS") for errors the UI needs to branch on. */
  code?: string;
};

type ParsedApiError = {
  message: string;
  code?: string;
};

export class ApiRequestError extends Error {
  readonly status?: number;

  readonly code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

export const parseApiError = async (response: Response): Promise<ParsedApiError> => {
  const errorBody = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const message = Array.isArray(errorBody?.message)
    ? errorBody.message.join(', ')
    : errorBody?.message;

  return {
    message: message ?? `Request failed (${response.status})`,
    code: errorBody?.code,
  };
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
    const { message, code } = await parseApiError(response);
    throw new ApiRequestError(message, response.status, code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
