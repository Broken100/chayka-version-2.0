import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import AdminPanel from './AdminPanel';
import {
  INITIAL_CATEGORIES,
  INITIAL_TABLES,
  INITIAL_PRODUCTS,
  DEFAULT_BUSINESS_CONFIG,
} from '../data';

describe('AdminPanel', () => {
  it('renders the login form when not authenticated', () => {
    render(
      <AdminPanel
        businessConfig={DEFAULT_BUSINESS_CONFIG}
        setBusinessConfig={() => {}}
        tables={INITIAL_TABLES}
        setTables={() => {}}
        menuProducts={INITIAL_PRODUCTS}
        setMenuProducts={() => {}}
        categories={INITIAL_CATEGORIES}
        reservations={[]}
        setReservations={() => {}}
      />
    );

    expect(screen.getByText('Administración Chayka')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });
});
