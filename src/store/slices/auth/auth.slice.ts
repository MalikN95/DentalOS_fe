import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
  id: string;
  // null for super_admin — a platform-wide account with no home clinic.
  clinicId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string | null;
  // Patient portal only — lets the auth guard redirect back to the right
  // clinic's /portal/{slug} login on logout/401 (staff logins don't set this).
  clinicSlug?: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    // Applied after a successful token refresh (rotation returns both tokens)
    setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    // Patches the current user in place — used after GET/PATCH /auth/me so
    // TopNav etc. reflect the real name/photo without a full re-login.
    updateProfile: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    logout: () => initialState,
  },
});

export const { setCredentials, setTokens, updateProfile, logout } = authSlice.actions;
