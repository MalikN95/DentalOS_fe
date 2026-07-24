import { API_URL } from '@/common/constants/env';
import { buildRequestHeaders } from '@/helpers/build-request-headers';
import type { AppStore } from '@/store';
import { logout, setTokens } from '@/store/slices/auth/auth.slice';

/**
 * Bridges the Redux store to plain (non-React) code such as `apiFetch`,
 * so token refresh and logout can happen outside the component tree.
 */
let store: AppStore | null = null;
let refreshPromise: Promise<string | null> | null = null;

export const registerAuthStore = (nextStore: AppStore): void => {
  store = nextStore;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

const performRefresh = async (): Promise<string | null> => {
  if (!store) {
    return null;
  }

  const { refreshToken } = store.getState().auth;

  if (!refreshToken) {
    store.dispatch(logout());
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: buildRequestHeaders(null),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      store.dispatch(logout());
      return null;
    }

    const data = (await response.json()) as RefreshResponse;
    store.dispatch(setTokens(data));
    return data.accessToken;
  } catch {
    store.dispatch(logout());
    return null;
  }
};

/**
 * Refreshes the access token, coalescing concurrent callers into a single
 * network request. Resolves to the new access token, or null when refresh
 * failed (in which case the user has been logged out).
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

/**
 * Best-effort server-side logout: invalidates the refresh jti on the backend.
 * Never throws — local state is cleared by the caller regardless.
 */
export const logoutRequest = async (accessToken: string | null): Promise<void> => {
  if (!accessToken) {
    return;
  }

  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: buildRequestHeaders(accessToken),
    });
  } catch {
    // ignore network errors — the session is being torn down anyway
  }
};
