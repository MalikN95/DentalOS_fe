import { API_URL } from '@/common/constants/env';
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
): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: buildRequestHeaders(accessToken, init?.headers),
  });

  if (response.ok === false) {
    throw new ApiRequestError(await parseApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
