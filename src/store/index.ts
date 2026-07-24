import { configureStore } from '@reduxjs/toolkit/react';
import { loadAuthState, saveAuthState } from '@/helpers/auth-storage';
import { authSlice } from '@/store/slices/auth/auth.slice';

export const makeStore = () => {
  const persistedAuth = loadAuthState();

  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: persistedAuth ? { auth: persistedAuth } : undefined,
  });

  // Persist auth (token + user) so a full reload keeps the session.
  store.subscribe(() => {
    saveAuthState(store.getState().auth);
  });

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
