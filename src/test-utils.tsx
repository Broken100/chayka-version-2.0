import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ReservationProvider } from './context/ReservationContext';

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ReservationProvider>{children}</ReservationProvider>;
}

function customRender(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
