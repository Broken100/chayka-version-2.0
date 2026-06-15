import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import BookingSection from './BookingSection';
import {
  INITIAL_TABLES,
  INITIAL_PRODUCTS,
  DEFAULT_BUSINESS_CONFIG,
} from '../data';

describe('BookingSection', () => {
  it('renders step 1 with date, time slot and guest selectors', () => {
    render(
      <BookingSection
        businessConfig={DEFAULT_BUSINESS_CONFIG}
        tables={INITIAL_TABLES}
        menuProducts={INITIAL_PRODUCTS}
        onReservationComplete={() => {}}
        existingReservations={[]}
      />
    );

    expect(screen.getByText('Elige Fecha y Cantidad')).toBeInTheDocument();
    expect(screen.getByLabelText('Seleccionar Fecha')).toBeInTheDocument();
    expect(screen.getByLabelText('Bloque Horario')).toBeInTheDocument();
    expect(screen.getByText('¿Para cuántas personas?')).toBeInTheDocument();
  });

  it('displays all configured time slots', () => {
    render(
      <BookingSection
        businessConfig={DEFAULT_BUSINESS_CONFIG}
        tables={INITIAL_TABLES}
        menuProducts={INITIAL_PRODUCTS}
        onReservationComplete={() => {}}
        existingReservations={[]}
      />
    );

    DEFAULT_BUSINESS_CONFIG.timeSlots.forEach((slot) => {
      expect(screen.getByText(`${slot} hs - Acceso de Mesa`)).toBeInTheDocument();
    });
  });
});
