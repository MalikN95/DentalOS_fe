'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { LocaleProvider } from '@/common/locale/LocaleProvider';
import { registerAuthStore } from '@/helpers/auth-bridge';
import { makeStore } from '@/store';
import { ToastProvider } from './ToastProvider';

type AppProvidersProps = {
  children: React.ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  const [store] = useState(() => {
    const createdStore = makeStore();
    registerAuthStore(createdStore);
    return createdStore;
  });

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <ToastProvider>{children}</ToastProvider>
        </LocaleProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
};
