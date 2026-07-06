import { configureStore } from '@reduxjs/toolkit/react';
import { authSlice } from '@/store/slices/auth/auth.slice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
