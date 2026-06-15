import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReservationProvider } from './context/ReservationContext';

function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      }
    }
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const client = makeTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <ReservationProvider>{children}</ReservationProvider>
    </QueryClientProvider>
  );
}

function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
